import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ms from "ms";
import { pagesS3Client } from "../clients/pagesS3Client";
import { envConfig } from "../envConfig";


/**
 * formats db error messages on new line.
 * and logs on the console.
 *
 * e.g. \
 * \* \
 * could not run `isDbTableEmpty` for table: nextSong \
 * errorMessage: Failed query... \
 * db error: column "posInQueue" does not exist \
 * \*
 */
export const logDbError = (message: string, e: unknown) => {
    const constructedMessage = "*" +
        "\n" +
        message + 
        "\n" +
        "errorMessage: " + (e as Error).message +
        "\n" +
        "db error: " + (e as any)?.cause +
        "\n" +
        "*";

    console.log(constructedMessage);
}



/**
 * deletes a file from S3.
 * 
 * returns false if anything goes wrong.
 */
export const deleteFileFromS3 = async (
    s3Key: string
): Promise<boolean> => {
    try {
        await pagesS3Client.send(
            new DeleteObjectCommand({
                Bucket: envConfig.AWS_BUCKET_NAME,
                Key: s3Key,
            })
        );

        return true;
    } catch (e) {
        console.log(
            `could not delete from S3, S3Key is `,
            s3Key,
            `error: `,
            (e as Error).message
        );

        return false;
    }
};


/**
 * an abstraction over the `ms` npm package,.
 * converts a duration string to seconds.
 *
 * @param value - A duration string (e.g. "1s", "5m", "2h")
 * @returns the duration in seconds
 */
export function secs(value: ms.StringValue): number {
    return ms(value) / 1000;
}



/**
 * returns a presigned url for an S3 object.
 * the url expires after `expiresInSecs` seconds, default is 1 hour.
 */
export const getSignedObjectUrlS3 = async (
    s3Key: string,
    expiresInSecs: number = secs("1h")
): Promise<string> => {
    return getSignedUrl(
        pagesS3Client,
        new GetObjectCommand({
            Bucket: envConfig.AWS_BUCKET_NAME,
            Key: s3Key,
        }),
        {
            expiresIn: expiresInSecs
        }
    )
}
