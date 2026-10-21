import crypto from 'crypto';
import express, { Request, Response } from 'express';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  aadhaarLast4?: string;
  district: string;
  mandal?: string;
  role: 'citizen' | 'volunteer' | 'admin';
  createdAt: string;
  passwordSalt?: string;
  passwordHash?: string;
}

const JWT_SECRET = process.env.AUTH_SECRET || 'praja-mitra-ap-welfare-secret-key-2025';

// Hash password with cryptographically random salt using scrypt
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
  } catch {
    return false;
  }
}

// Lightweight secure JWT implementation using HMAC-SHA256 (no external dependency needed)
export function createToken(payload: { id: string; mobile: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days validity
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { id: string; mobile: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Pre-seeded demo citizens for instant testing without registration friction
const defaultSaltHash = hashPassword('Praja@123');
export const usersDb: User[] = [
  {
    id: 'user_1',
    name: 'N. Narasimha Rao (నరసింహారావు)',
    mobile: '9876543210',
    email: 'narasimha.farmer@ap.gov.in',
    aadhaarLast4: '5432',
    district: 'Guntur (గుంటూరు)',
    mandal: 'Tenali (తెనాలి)',
    role: 'citizen',
    createdAt: new Date().toISOString(),
    passwordSalt: defaultSaltHash.salt,
    passwordHash: defaultSaltHash.hash,
  },
  {
    id: 'user_2',
    name: 'K. Lakshmi Devi (లక్ష్మి దేవి)',
    mobile: '9123456780',
    email: 'lakshmi.mother@ap.gov.in',
    aadhaarLast4: '9876',
    district: 'Krishna (కృష్ణా)',
    mandal: 'Gudivada (గుడివాడ)',
    role: 'citizen',
    createdAt: new Date().toISOString(),
    passwordSalt: defaultSaltHash.salt,
    passwordHash: defaultSaltHash.hash,
  },
  {
    id: 'user_3',
    name: 'M. Venkata Ramana (వెంకట రమణ)',
    mobile: '9440123456',
    email: 'ramana.pension@ap.gov.in',
    aadhaarLast4: '1234',
    district: 'Visakhapatnam (విశాఖపట్నం)',
    mandal: 'Anakapalli (అనకాపల్లి)',
    role: 'citizen',
    createdAt: new Date().toISOString(),
    passwordSalt: defaultSaltHash.salt,
    passwordHash: defaultSaltHash.hash,
  },
];

// In-memory OTP storage: mobile -> { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const authRouter = express.Router();

// GET /api/auth/demo-users
authRouter.get('/demo-users', (req: Request, res: Response) => {
  res.json({
    users: usersDb.map((u) => ({
      name: u.name,
      mobile: u.mobile,
      aadhaarLast4: u.aadhaarLast4,
      district: u.district,
      demoPassword: 'Praja@123',
    })),
  });
});

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { name, mobile, email, password, district, mandal, aadhaarLast4 } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name.' });
    }

    const cleanMobile = (mobile || '').replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if mobile is already registered
    const existing = usersDb.find((u) => u.mobile === cleanMobile);
    if (existing) {
      return res.status(409).json({ error: 'This mobile number is already registered. Please log in.' });
    }

    const { salt, hash } = hashPassword(password);
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      mobile: cleanMobile,
      email: email ? email.trim() : undefined,
      aadhaarLast4: aadhaarLast4 ? aadhaarLast4.slice(-4) : undefined,
      district: district || 'Andhra Pradesh',
      mandal: mandal || '',
      role: 'citizen',
      createdAt: new Date().toISOString(),
      passwordSalt: salt,
      passwordHash: hash,
    };

    usersDb.push(newUser);

    const token = createToken({ id: newUser.id, mobile: newUser.mobile, role: newUser.role });

    // Strip sensitive fields
    const { passwordSalt, passwordHash, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Citizen registered successfully.',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide mobile/email and password.' });
    }

    const cleanId = identifier.trim();
    const cleanMobile = cleanId.replace(/\D/g, '');

    const user = usersDb.find(
      (u) =>
        (cleanMobile.length === 10 && u.mobile === cleanMobile) ||
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
    );

    if (!user || !user.passwordSalt || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid mobile number/email or password.' });
    }

    const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid mobile number/email or password.' });
    }

    const token = createToken({ id: user.id, mobile: user.mobile, role: user.role });
    const { passwordSalt, passwordHash, ...safeUser } = user;

    return res.json({
      message: 'Logged in successfully.',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/send-otp (Aadhaar or Mobile OTP login)
authRouter.post('/send-otp', (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;
    const cleanMobile = (mobile || '').replace(/\D/g, '');

    if (cleanMobile.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    otpStore.set(cleanMobile, { otp, expiresAt });

    console.log(`[Praja Mitra Auth] OTP for ${cleanMobile}: ${otp}`);

    return res.json({
      success: true,
      message: `OTP sent to +91 ${cleanMobile.slice(0, 2)}****${cleanMobile.slice(6)}. Valid for 5 minutes.`,
      // devOtp is provided for demonstration convenience so users can test seamlessly without SMS setup
      devOtp: otp,
    });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Failed to generate OTP.' });
  }
});

// POST /api/auth/verify-otp
authRouter.post('/verify-otp', (req: Request, res: Response) => {
  try {
    const { mobile, otp, name, district } = req.body;
    const cleanMobile = (mobile || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();

    if (cleanMobile.length !== 10 || cleanOtp.length !== 6) {
      return res.status(400).json({ error: 'Please enter a valid mobile number and 6-digit OTP.' });
    }

    const record = otpStore.get(cleanMobile);
    // Allow master demo OTP '123456' or the generated otp
    const isMasterOtp = cleanOtp === '123456';
    const isStoredOtp = record && record.otp === cleanOtp && record.expiresAt > Date.now();

    if (!isMasterOtp && !isStoredOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please try again or request a new OTP.' });
    }

    // Clean up OTP after use
    otpStore.delete(cleanMobile);

    // Find or auto-register citizen profile
    let user = usersDb.find((u) => u.mobile === cleanMobile);
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        name: name ? name.trim() : `Citizen (${cleanMobile.slice(-4)})`,
        mobile: cleanMobile,
        aadhaarLast4: cleanMobile.slice(-4),
        district: district || 'Andhra Pradesh',
        role: 'citizen',
        createdAt: new Date().toISOString(),
      };
      usersDb.push(user);
    }

    const token = createToken({ id: user.id, mobile: user.mobile, role: user.role });
    const { passwordSalt, passwordHash, ...safeUser } = user;

    return res.json({
      message: 'OTP verified successfully.',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

// GET /api/auth/me (Get authenticated citizen profile)
authRouter.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    const user = usersDb.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Citizen profile not found.' });
    }

    const { passwordSalt, passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err: any) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to get citizen profile.' });
  }
});
