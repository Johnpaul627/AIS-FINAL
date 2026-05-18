import test from 'node:test';
import assert from 'node:assert/strict';
import {
    toLegacyStudent,
    fromLegacyStudent,
    extractLegacyStudentId,
    fetchById
} from '../adapter_layer/adapters/authAdapter.js';

test('toLegacyStudent converts portal/auth format to legacy format', () => {
    const result = toLegacyStudent({
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        dob: '2004-05-20',
        course: 'BSIT',
        major: 'Business Analytics',
        address: 'Manila',
        status: 'Regular'
    });

    assert.deepEqual(result, {
        name: 'Juan Dela Cruz',
        birthdate: '2004-05-20',
        program: 'BSIT Business Analytics',
        address: 'Manila',
        studentStatus: 'Regular'
    });
});

test('fromLegacyStudent converts legacy format back to student portal format', () => {
    const result = fromLegacyStudent({
        _id: 'abc123',
        name: 'Juan Dela Cruz',
        birthdate: '2004-05-20T00:00:00.000Z',
        program: 'BSIT Business Analytics',
        address: 'Manila',
        studentStatus: 'Regular'
    });

    assert.deepEqual(result, {
        legacyStudentId: 'abc123',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        dob: '2004-05-20',
        course: 'BSIT',
        major: 'Business Analytics',
        address: 'Manila',
        status: 'Regular'
    });
});

test('extractLegacyStudentId supports common legacy id field names', () => {
    assert.equal(extractLegacyStudentId({ _id: 'mongo-id' }), 'mongo-id');
    assert.equal(extractLegacyStudentId({ id: 'id-field' }), 'id-field');
    assert.equal(extractLegacyStudentId({ studentId: 'student-id' }), 'student-id');
});

test('fetchById calls the legacy GET endpoint and returns converted profile', async () => {
    const originalFetch = global.fetch;

    global.fetch = async (url) => {
        assert.equal(url, 'https://ais-simulated-legacy.onrender.com/api/students/abc123');
        return {
            ok: true,
            status: 200,
            text: async () => JSON.stringify({
                _id: 'abc123',
                name: 'Maria Santos',
                birthdate: '2003-03-01T00:00:00.000Z',
                program: 'BSIT Network Technology',
                address: 'Batangas',
                studentStatus: 'Irregular'
            })
        };
    };

    try {
        const result = await fetchById('abc123');
        assert.deepEqual(result, {
            legacyStudentId: 'abc123',
            firstName: 'Maria',
            lastName: 'Santos',
            dob: '2003-03-01',
            course: 'BSIT',
            major: 'Network Technology',
            address: 'Batangas',
            status: 'Irregular'
        });
    } finally {
        global.fetch = originalFetch;
    }
});
