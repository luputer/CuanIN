import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { z } from 'zod'
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const s3Client = new S3Client({
    forcePathStyle: false,
    endpoint: env.BUCKET_ENDPOINT,
    region: env.BUCKET_REGION,
    credentials: {
        accessKeyId: env.BUCKET_ACCESS_KEY,
        secretAccessKey: env.BUCKET_SECRET_KEY,
    },
})

export const s3Router = createTRPCRouter({
    getUploadPresignedUrl: protectedProcedure
        .input(
            z.object({
                key: z.string(),
                fileType: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const { key, fileType } = input

            try {
                const putObjectCommand = new PutObjectCommand({
                    Bucket: env.BUCKET_NAME,
                    Key: key,
                    ContentType: fileType || 'application/octet-stream; charset=binary',
                    ACL: 'public-read',
                })

                return await getSignedUrl(s3Client, putObjectCommand)
            } catch (e) {
                console.error(e)
                throw e
            }
        }),

    deleteObject: protectedProcedure.input(z.object({ key: z.string() })).mutation(async ({ input }) => {
        const { key } = input

        try {
            const deleteObjectCommand = new DeleteObjectCommand({
                Bucket: env.BUCKET_NAME,
                Key: key,
            })

            await s3Client.send(deleteObjectCommand)
        } catch (e) {
            console.error(e)
            throw e
        }
    }),
})
