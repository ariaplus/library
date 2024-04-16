import {
  doc,
  query,
  where,
  limit,
  setDoc,
   getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
  writeBatch,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './app';
import {
  usersCollection,
  tweetsCollection,
  userStatsCollection,
  userBookmarksCollection,
  tickersCollection,
  hashtagsCollection
} from './collections';
import type { WithFieldValue, Query } from 'firebase/firestore';
import type { EditableUserData } from '@lib/types/user';
import type { FilesWithId, ImagesPreview } from '@lib/types/file';
import type { Bookmark } from '@lib/types/bookmark';

import type { Tickers } from '@lib/types/tickers';
import type { Hashtags } from '@lib/types/hashtags';

import type { Theme, Accent } from '@lib/types/theme';

export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  const { empty } = await getDocs(
    query(usersCollection, where('username', '==', username), limit(1))
  );
  return empty;
}

export async function getCollectionCount<T>(
  collection: Query<T>
): Promise<number> {
  const snapshot = await getCountFromServer(collection);
  return snapshot.data().count;
}

export async function updateUserData(
  userId: string,
  userData: EditableUserData
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp()
  });
}

export async function updateUserTheme(
  userId: string,
  themeData: { theme?: Theme; accent?: Accent }
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, { ...themeData });
}

export async function updateUsername(
  userId: string,
  username?: string
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    ...(username && { username }),
    updatedAt: serverTimestamp()
  });
}

export async function managePinnedTweet(
  type: 'pin' | 'unpin',
  userId: string,
  tweetId: string
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    updatedAt: serverTimestamp(),
    pinnedTweet: type === 'pin' ? tweetId : null
  });
}

export async function manageFollow(
  type: 'follow' | 'unfollow',
  userId: string,
  targetUserId: string
): Promise<void> {
  const batch = writeBatch(db);

  const userDocRef = doc(usersCollection, userId);
  const targetUserDocRef = doc(usersCollection, targetUserId);

  if (type === 'follow') {
    batch.update(userDocRef, {
      following: arrayUnion(targetUserId),
      updatedAt: serverTimestamp()
    });
    batch.update(targetUserDocRef, {
      followers: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  } else {
    batch.update(userDocRef, {
      following: arrayRemove(targetUserId),
      updatedAt: serverTimestamp()
    });
    batch.update(targetUserDocRef, {
      followers: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
}

export async function removeTweet(tweetId: string): Promise<void> {
  const userRef = doc(tweetsCollection, tweetId);
  await deleteDoc(userRef);
}

export async function uploadImages(
  userId: string,
  files: FilesWithId
): Promise<ImagesPreview | null> {
  if (!files.length) return null;

  const imagesPreview = await Promise.all(
    files.map(async (file) => {
      const { id, name: alt, type } = file;

      const storageRef = ref(storage, `images/${userId}/${id}`);

      await uploadBytesResumable(storageRef, file);
      
      const src = await getDownloadURL(storageRef);

      return { id, src, alt, type };
    })
  );

  return imagesPreview;
}

export async function manageReply(
  type: 'increment' | 'decrement',
  tweetId: string
): Promise<void> {
  const tweetRef = doc(tweetsCollection, tweetId);

  try {
    await updateDoc(tweetRef, {
      userReplies: increment(type === 'increment' ? 1 : -1),
      updatedAt: serverTimestamp()
    });
  } catch {
    // do nothing, because parent tweet was already deleted
  }
}

export async function manageTotalTweets(
  type: 'increment' | 'decrement',
  userId: string
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    totalTweets: increment(type === 'increment' ? 1 : -1),
    updatedAt: serverTimestamp()
  });
}

export async function manageTotalPhotos(
  type: 'increment' | 'decrement',
  userId: string
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    totalPhotos: increment(type === 'increment' ? 1 : -1),
    updatedAt: serverTimestamp()
  });
}

export function manageRetweet(
  type: 'retweet' | 'unretweet',
  userId: string,
  tweetId: string
) {
  return async (): Promise<void> => {
    const batch = writeBatch(db);

    const tweetRef = doc(tweetsCollection, tweetId);
    const userStatsRef = doc(userStatsCollection(userId), 'stats');

    if (type === 'retweet') {
      batch.update(tweetRef, {
        userRetweets: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        tweets: arrayUnion(tweetId),
        updatedAt: serverTimestamp()
      });
    } else {
      batch.update(tweetRef, {
        userRetweets: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        tweets: arrayRemove(tweetId),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
  };
}

export function manageLike(
  type: 'like' | 'unlike',
  userId: string,
  tweetId: string
) {
  return async (): Promise<void> => {
    const batch = writeBatch(db);

    const userStatsRef = doc(userStatsCollection(userId), 'stats');
    const tweetRef = doc(tweetsCollection, tweetId);

    if (type === 'like') {
      batch.update(tweetRef, {
        userLikes: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        likes: arrayUnion(tweetId),
        updatedAt: serverTimestamp()
      });
    } else {
      batch.update(tweetRef, {
        userLikes: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        likes: arrayRemove(tweetId),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
  };
}

export async function manageBookmark(
  type: 'bookmark' | 'unbookmark',
  userId: string,
  tweetId: string
): Promise<void> {
  const bookmarkRef = doc(userBookmarksCollection(userId), tweetId);

  if (type === 'bookmark') {
    const bookmarkData: WithFieldValue<Bookmark> = {
      id: tweetId,
      createdAt: serverTimestamp()
    };
    await setDoc(bookmarkRef, bookmarkData);
  } else await deleteDoc(bookmarkRef);
}

export async function clearAllBookmarks(userId: string): Promise<void> {
  const bookmarksRef = userBookmarksCollection(userId);
  const bookmarksSnapshot = await getDocs(bookmarksRef);

  const batch = writeBatch(db);

  bookmarksSnapshot.forEach(({ ref }) => batch.delete(ref));

  await batch.commit();
}


export async function manageTickers(type: 'add' | 'remove', tickers: string[], tweetId: string): Promise<void> {
  const batch = writeBatch(db);

  for (const ticker of tickers) {
    const tickerRef = doc(tickersCollection, ticker);

    // Get the current ticker document
    const tickerSnap = await getDoc(tickerRef);

    // If ticker does not exist and type is 'add', create a new ticker
    if (!tickerSnap.exists() && type === 'add') {
      const newTicker: WithFieldValue<Tickers> = {
        name: ticker,
        tweets: [tweetId],
        createdAt: serverTimestamp()
      };
      batch.set(tickerRef, newTicker);
      continue;
    }

    // If ticker does not exist and type is 'remove', skip
    if (!tickerSnap.exists() && type === 'remove') {
      continue;
    }

    // At this point, the ticker document must exist
    const tickerData = tickerSnap.data();

    // Ensure tickerData is defined before accessing its properties
    if (tickerData) {
      if (type === 'add') {
        // Add the tweetId to the tweets array if it's not already there
        if (!tickerData.tweets?.includes(tweetId)) {
          batch.update(tickerRef, { tweets: arrayUnion(tweetId) });
        }
      } else if (type === 'remove') {
        // Remove the tweetId from the tweets array
        batch.update(tickerRef, { tweets: arrayRemove(tweetId) });
      }
    }
  }

  // Commit the batch
  await batch.commit();
}

// Hashtags Utils 
export async function manageHashtags(type: 'add' | 'remove', hashtags: string[], tweetId: string): Promise<void> {
  const batch = writeBatch(db);

  for (const hashtag of hastags) {
    const hashtagRef = doc(hashtagCollection, hashtag);

    // Get the current ticker document
    const hashtagSnap = await getDoc(hashtagRef);

    // If ticker does not exist and type is 'add', create a new ticker
    if (!hashtagSnap.exists() && type === 'add') {
      const newHashtag: WithFieldValue<Hashtags> = {
        name: hashtag,
        tweets: [tweetId],
        createdAt: serverTimestamp()
      };
      batch.set(hashtagRef, newHashtag);
      continue;
    }

    // If ticker does not exist and type is 'remove', skip
    if (!hashtagSnap.exists() && type === 'remove') {
      continue;
    }

    // At this point, the ticker document must exist
    const hashtagData = hashtagSnap.data();

    if (type === 'add') {
      // Add the tweetId to the tweets array if it's not already there
      if (!hashtagData.tweets.includes(tweetId)) {
        hashtagData.tweets.push(tweetId);
      }
    } else if (type === 'remove') {
      // Remove the tweetId from the tweets array
     hashtagData.tweets = hashtagData.tweets.filter(id => id !== tweetId);
    }

    // Update the ticker document in the batch
    batch.update(hashtagRef, hashtagData);
  }

  // Commit the batch
  await batch.commit();
}
