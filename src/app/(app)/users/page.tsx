// app/users/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { username: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المستخدمين</h1>
        <Link href="/users/new">
          <Button>+ إضافة مستخدم جديد</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 space-y-2">
              <div className="text-lg font-semibold">{user.username}</div>
              <div className="text-sm text-muted-foreground">
                الدور: {user.role}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
