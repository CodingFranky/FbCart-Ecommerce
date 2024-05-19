import passport from 'passport';


export function isAuth(req, res,done) {
  return passport.authenticate('jwt');
};

export function sanitizeUser(user) {
  return { id: user.id, role: user.role };
};

export function cookieExtractor(req) {

  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  
  return token;
};
