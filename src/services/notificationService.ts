import { Complaint, Comment, ComplaintStatus } from '../types';

export interface EmailPayload {
  to: string;
  type: 'upvote' | 'comment' | 'status_update' | 'admin_note';
  complaintTitle: string;
  complaintId: string;
  actorName?: string;
  commentText?: string;
  statusText?: string;
  adminNoteText?: string;
}

/**
 * Sends notification email via backend API proxy
 */
export async function sendNotificationEmail(payload: EmailPayload): Promise<boolean> {
  if (!payload.to || !payload.to.includes('@')) {
    return false;
  }

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn('Notification email API responded with non-200:', res.status);
      return false;
    }

    const data = await res.json();
    return Boolean(data.success);
  } catch (error) {
    console.warn('Could not dispatch notification email:', error);
    return false;
  }
}

/**
 * Triggers notification when a complaint is upvoted
 */
export async function notifyOnUpvote(complaint: Complaint) {
  if (!complaint.authorEmail || complaint.notificationsEnabled === false) return;

  await sendNotificationEmail({
    to: complaint.authorEmail,
    type: 'upvote',
    complaintTitle: complaint.title,
    complaintId: complaint.id,
  });
}

/**
 * Triggers notification when a new comment is added
 */
export async function notifyOnComment(complaint: Complaint, comment: Comment) {
  if (!complaint.authorEmail || complaint.notificationsEnabled === false) return;

  await sendNotificationEmail({
    to: complaint.authorEmail,
    type: 'comment',
    complaintTitle: complaint.title,
    complaintId: complaint.id,
    actorName: comment.isAnonymous ? 'Anonim Bir Öğrenci' : comment.author,
    commentText: comment.text,
  });
}

/**
 * Triggers notification when complaint status is changed
 */
export async function notifyOnStatusChange(
  complaint: Complaint,
  newStatus: ComplaintStatus,
  adminNote?: string
) {
  if (!complaint.authorEmail || complaint.notificationsEnabled === false) return;

  await sendNotificationEmail({
    to: complaint.authorEmail,
    type: 'status_update',
    complaintTitle: complaint.title,
    complaintId: complaint.id,
    statusText: newStatus,
    adminNoteText: adminNote,
  });
}

/**
 * Triggers notification when admin adds or updates official response note
 */
export async function notifyOnAdminNote(complaint: Complaint, adminNote: string) {
  if (!complaint.authorEmail || complaint.notificationsEnabled === false) return;

  await sendNotificationEmail({
    to: complaint.authorEmail,
    type: 'admin_note',
    complaintTitle: complaint.title,
    complaintId: complaint.id,
    adminNoteText: adminNote,
  });
}
