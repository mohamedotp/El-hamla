import { chain } from "./middlewares/chain";
import withAuth from "./middlewares/withAuth";
import withPathname from "./middlewares/withPathname";
import withRoleAccess from "./middlewares/withRoleAccess";

export default chain([withAuth, withRoleAccess, withPathname]);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
