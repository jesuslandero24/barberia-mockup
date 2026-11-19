export type ContactConflict = "phone" | "email" | "both";

export function getContactConflict({
  phoneMatchId,
  emailMatchId,
  existingPhone,
  existingEmail,
  phone,
  email,
}: {
  phoneMatchId?: string;
  emailMatchId?: string;
  existingPhone?: string;
  existingEmail?: string;
  phone: string;
  email: string;
}): ContactConflict | null {
  if (phoneMatchId && emailMatchId && phoneMatchId !== emailMatchId) {
    return "both";
  }

  if (
    phoneMatchId &&
    existingEmail &&
    existingEmail.trim().toLowerCase() !== email
  ) {
    return "phone";
  }

  if (
    emailMatchId &&
    existingPhone &&
    existingPhone.replace(/\D/g, "") !== phone
  ) {
    return "email";
  }

  return null;
}
