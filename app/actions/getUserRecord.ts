'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

async function getUserRecord(): Promise<{
  record?: number;
  daysWithRecords?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    // Explicitly type each record
    const records: { amount: number }[] = await db.records.findMany({
      where: { userId },
      select: { amount: true }, // Only fetch the amount field
    });

    // Type the accumulator and element in reduce
    const record = records.reduce(
      (sum: number, record: { amount: number }) => sum + record.amount,
      0
    );

    // Count the number of days with valid expense records
    const daysWithRecords = records.filter(
      (record: { amount: number }) => record.amount > 0
    ).length;

    return { record, daysWithRecords };
  } catch (error) {
    console.error('Error fetching user record:', error);
    return { error: 'Database error' };
  }
}

export default getUserRecord;
