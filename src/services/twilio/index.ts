import { Twilio } from 'twilio';

export const sendMessage = async (to: string, body: string) => {
  try {
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: `+${to}`,
    });

    return message;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to send message');
  }
};
