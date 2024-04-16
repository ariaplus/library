import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

export type Hashtags = {
    name: string;
    tweets: string[];
    createdAt: Timestamp;
};

export const hashtagsConverter: FirestoreDataConverter<Hashtags> = {
    toFirestore(hashtags) {
        return { ...hashtags };
    },
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);

        return { ...data } as Hashtags;
    }
};
