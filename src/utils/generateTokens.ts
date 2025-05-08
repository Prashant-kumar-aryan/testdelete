import jwt, { SignOptions, Secret } from 'jsonwebtoken';

interface TokenPayload  {
    _id: string;
    email: string;
    role: string;
    iat?: number;  // Issued At timestamp
    exp?: number;  // Expiration timestamp
}

const generateAccessToken = (_id: string, email: string, role: string): string => {
    const secretKey = process.env.JWT_SECRET_KEY;
    const expiration = process.env.JWT_EXPIRATION;

    if (!secretKey) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }

    if (!expiration) {
        throw new Error('JWT_EXPIRATION is not defined in environment variables');
    }

    try {
        const payload: TokenPayload = {
            _id,
            email,
            role
        };

        const options: SignOptions = {
            expiresIn: expiration as  jwt.SignOptions['expiresIn'],
        };

        return jwt.sign(payload, secretKey as Secret, options);
    } catch (error) {
        throw new Error(`Error generating access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const generateRefreshToken = (_id: string): string => {
    const secretKey = process.env.JWT_SECRET_KEY;
    const expiration = process.env.REFRESH_TOKEN_EXPIRATION;
    if (!secretKey) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }

    if (!expiration) {
        throw new Error('JWT_EXPIRATION is not defined in environment variables');
    }
    try {
        const options: SignOptions = {
            expiresIn: expiration as  jwt.SignOptions['expiresIn'],
        };
        return jwt.sign({_id}, secretKey as Secret, options);
    } catch (error) {
        throw new Error(`Error generating access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export {
    generateAccessToken,
    generateRefreshToken,
    TokenPayload
};