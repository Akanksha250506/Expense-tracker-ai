import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function checkUser() {
  const user = await currentUser();

  // No signed-in Clerk user
  if (!user) return null;

  // Check if user exists in DB
  let loggedInUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  // If user exists, return it
  if (loggedInUser) return loggedInUser;

  // Otherwise create a new one
  loggedInUser = await db.user.create({
    data: {
      clerkUserId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",  // fallback empty string
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      imageUrl: user.imageUrl,
    },
  });

  return loggedInUser;
}
