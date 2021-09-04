import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Invalid params' });
  }

  try {
    await fetch(
      'https://emailoctopus.com/api/1.5/lists/bc3bdbe2-f3de-11eb-96e5-06b4694bee2a/contacts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.EMAILOCTOPUS_KEY,
          email_address: email,
          status: 'SUBSCRIBED',
        }),
      }
    );
    res.status(200).end();
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : 'There was a problem updating the email list.';
    res.status(500).json({ message });
  }
}
