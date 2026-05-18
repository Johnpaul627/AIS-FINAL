const LEGACY_BASE_URL = (process.env.LEGACY_BASE_URL || 'https://ais-simulated-legacy.onrender.com').replace(/\/$/, '');

const formatDateOnly = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 10);
};

const splitName = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ')
    };
};

const splitProgram = (program = '') => {
    const normalized = String(program).trim();

    if (normalized.includes(' - ')) {
        const [course, ...majorParts] = normalized.split(' - ');
        return {
            course: course.trim(),
            major: majorParts.join(' - ').trim()
        };
    }

    const parts = normalized.split(/\s+/).filter(Boolean);
    return {
        course: parts[0] || '',
        major: parts.slice(1).join(' ')
    };
};

export const extractLegacyStudentId = (legacyStudent) => {
    if (!legacyStudent || typeof legacyStudent !== 'object') return null;
    return legacyStudent._id || legacyStudent.id || legacyStudent.studentId || legacyStudent.legacyStudentId || null;
};

export const toLegacyStudent = (profile) => {
    return {
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        birthdate: profile.dob,
        address: profile.address,
        program: [profile.course, profile.major].filter(Boolean).join(' ').trim(),
        studentStatus: profile.status,
    };
};

export const fromLegacyStudent = (legacyStudent) => {
    if (!legacyStudent || typeof legacyStudent !== 'object') {
        throw new Error('Legacy student profile is empty or invalid.');
    }

    const { firstName, lastName } = splitName(legacyStudent.name);
    const { course, major } = splitProgram(legacyStudent.program);

    return {
        legacyStudentId: extractLegacyStudentId(legacyStudent),
        firstName,
        lastName,
        dob: formatDateOnly(legacyStudent.birthdate),
        course,
        major,
        address: legacyStudent.address || '',
        status: legacyStudent.studentStatus || legacyStudent.status || ''
    };
};

const readLegacyResponse = async (response) => {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
};

export const create = async (profile) => {
    const transformedProfile = toLegacyStudent(profile);

    console.log('Sending to legacy system:');
    console.log(transformedProfile);

    const response = await fetch(`${LEGACY_BASE_URL}/api/students`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedProfile),
    });

    const data = await readLegacyResponse(response);
    console.log('Legacy response status:', response.status);

    if (!response.ok) {
        console.log('Legacy response error body:', data);
        throw new Error(`Legacy system request failed: ${response.status} ${JSON.stringify(data)}`);
    }

    console.log('Legacy response success body:', data);
    return data;
};

export const fetchById = async (legacyStudentId) => {
    const response = await fetch(`${LEGACY_BASE_URL}/api/students/${encodeURIComponent(legacyStudentId)}`);
    const data = await readLegacyResponse(response);

    if (!response.ok) {
        throw new Error(`Legacy student fetch failed: ${response.status} ${JSON.stringify(data)}`);
    }

    if (!data) {
        throw new Error('No student profile found in the legacy system.');
    }

    return fromLegacyStudent(data);
};
