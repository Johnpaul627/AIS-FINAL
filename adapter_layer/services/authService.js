import * as AuthAdapter from '../adapters/authAdapter.js';

export const validateStudentProfile = (studentProfile) => {
    if (!studentProfile || typeof studentProfile !== 'object') {
        throw new Error('Student profile is required');
    }
    if (!studentProfile.firstName) {
        throw new Error('First name is required');
    }
    if (!studentProfile.lastName) {
        throw new Error('Last name is required');
    }
    if (!studentProfile.dob) {
        throw new Error('Date of birth is required');
    }
    if (!studentProfile.course) {
        throw new Error('Course is required');
    }
    if (!studentProfile.major) {
        throw new Error('Major is required');
    }
    if (!studentProfile.address) {
        throw new Error('Address is required');
    }
    if (!studentProfile.status) {
        throw new Error('Student status is required');
    }
};

export const registerStudent = async (studentProfile) => {
    validateStudentProfile(studentProfile);
    return AuthAdapter.create(studentProfile);
};

export const fetchStudentProfile = async (legacyStudentId) => {
    if (!legacyStudentId) {
        throw new Error('Legacy student id is required');
    }

    return AuthAdapter.fetchById(legacyStudentId);
};

export const toPortalProfile = (legacyStudent) => {
    return AuthAdapter.fromLegacyStudent(legacyStudent);
};

export const getLegacyStudentId = (legacyStudent) => {
    return AuthAdapter.extractLegacyStudentId(legacyStudent);
};
