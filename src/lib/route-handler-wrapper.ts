// lib/validate.ts
import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
type Handler = (req: NextRequest, body: any) => Promise<Response>;

export function withValidation(
  schema: yup.ObjectSchema<yup.Maybe<yup.AnyObject>>,
  handler: Handler,
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest): Promise<Response> => {
    try {
      const body = await req.json();
      const validatedBody = await schema.validate(body, { abortEarly: false });

      // تمرير الجسم المفحوص مع الطلب
      return handler(req, validatedBody);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path && !fieldErrors[e.path]) {
            fieldErrors[e.path] = e.message;
          }
        });
        return NextResponse.json(
          { message: "Validation failed", details: fieldErrors },
          { status: 400 },
        );
      }

      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }
  };
}
export const routeHandlerWrapper = (
  handler: (req: NextRequest, context: { params: { [key: string]: string } }) => Promise<Response>
) => {
  return async (req: NextRequest, context: { params: { [key: string]: string } }): Promise<Response> => {
    try {
      return await handler(req, context);
    } catch (err) {
      console.error("Route error:", err);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  };
};
