import { DeleteObjectCommand } from "@aws-sdk/client-s3";
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
