import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Complaint, ComplaintStatus, Comment } from '../types';
import { getMyComplaintIds } from '../utils/storage';

const COLLECTION_NAME = 'complaints';

/**
 * Real-time listener for all complaints in Firestore
 */
export function subscribeToComplaints(
  onUpdate: (complaints: Complaint[]) => void,
  onError?: (error: Error) => void
) {
  const pathForSnapshot = COLLECTION_NAME;
  const q = query(collection(db, COLLECTION_NAME));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const myIds = getMyComplaintIds();
      const items: Complaint[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'Diğer',
          status: data.status || 'İnceleniyor',
          author: data.author || 'Anonim',
          authorEmail: data.authorEmail || undefined,
          notificationsEnabled: data.notificationsEnabled !== undefined ? Boolean(data.notificationsEnabled) : true,
          isAnonymous: !!data.isAnonymous,
          date: data.date || '',
          imageUrl: data.imageUrl || undefined,
          upvotes: typeof data.upvotes === 'number' ? data.upvotes : 0,
          upvotedByMe: !!data.upvotedByMe,
          isMine: myIds.includes(docSnap.id) || !!data.isMine,
          comments: Array.isArray(data.comments) ? data.comments : [],
          adminNote: data.adminNote || undefined,
          adminUpdatedAt: data.adminUpdatedAt || undefined,
        });
      });

      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, pathForSnapshot);
    }
  );

  return unsubscribe;
}

/**
 * Adds a new complaint to Firestore
 */
export async function addComplaintToFirestore(
  complaintData: Omit<Complaint, 'id' | 'status' | 'upvotes' | 'comments'>,
  id: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanDoc: Record<string, any> = {
      title: complaintData.title,
      description: complaintData.description,
      category: complaintData.category,
      status: 'İnceleniyor',
      author: complaintData.author,
      isAnonymous: Boolean(complaintData.isAnonymous),
      date: complaintData.date,
      upvotes: 1,
      comments: [],
      notificationsEnabled: complaintData.notificationsEnabled !== false,
    };

    if (complaintData.authorEmail) {
      cleanDoc.authorEmail = complaintData.authorEmail.trim();
    }

    if (complaintData.imageUrl) {
      cleanDoc.imageUrl = complaintData.imageUrl;
    }

    await setDoc(docRef, cleanDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates full complaint (edit by author)
 */
export async function updateComplaintInFirestore(complaint: Complaint): Promise<void> {
  const path = `${COLLECTION_NAME}/${complaint.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, complaint.id);
    const updateData: Record<string, any> = {
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      author: complaint.author,
      isAnonymous: Boolean(complaint.isAnonymous),
      date: complaint.date,
      notificationsEnabled: complaint.notificationsEnabled !== false,
    };

    if (complaint.authorEmail !== undefined) {
      updateData.authorEmail = complaint.authorEmail.trim();
    }

    if (complaint.imageUrl !== undefined) {
      updateData.imageUrl = complaint.imageUrl;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Updates status of a complaint (admin)
 */
export async function updateComplaintStatusInFirestore(
  id: string,
  newStatus: ComplaintStatus,
  adminUpdatedAt: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: newStatus,
      adminUpdatedAt,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Updates official admin response note
 */
export async function updateComplaintAdminNoteInFirestore(
  id: string,
  adminNote: string,
  adminUpdatedAt: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      adminNote: adminNote || '',
      adminUpdatedAt,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Increments / decrements upvote count
 */
export async function toggleUpvoteInFirestore(
  id: string,
  newUpvotes: number
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      upvotes: Math.max(0, newUpvotes),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Adds comment to a complaint
 */
export async function addCommentToFirestore(
  complaintId: string,
  comments: Comment[]
): Promise<void> {
  const path = `${COLLECTION_NAME}/${complaintId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, complaintId);
    await updateDoc(docRef, {
      comments,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes complaint from Firestore
 */
export async function deleteComplaintFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
