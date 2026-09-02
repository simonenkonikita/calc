// backend/src/strategies/jwt.strategy.ts
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import passport from "passport";
import { Request } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { JwtPayload, AuthUser } from "../types/auth.types";

// Экстрактор токена из cookie
const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies.token || null;
  }
  return null;
};

// Экстрактор из Bearer заголовка
const bearerExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

// Комбинированный экстрактор
const jwtExtractor = (req: Request): string | null => {
  const tokenFromCookie = cookieExtractor(req);
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  const tokenFromBearer = bearerExtractor(req);
  if (tokenFromBearer) {
    return tokenFromBearer;
  }

  return null;
};

const options: StrategyOptions = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: process.env.JWT_SECRET || "default_secret",
  passReqToCallback: true,
};

passport.use(
  "jwt",
  new JwtStrategy(
    options,
    async (req: Request, payload: JwtPayload, done: any) => {
      try {
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({
          where: { id: payload.id },
        });

        if (!user) {
          return done(null, false, { message: "Пользователь не найден" });
        }

        if (!user.isActive) {
          return done(null, false, {
            message: "Учетная запись деактивирована",
          });
        }

        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          role: user.role,
          company: user.company || undefined,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          phone: user.phone || undefined,
          position: user.position || undefined,
          isActive: user.isActive,
        };

        return done(null, authUser);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
