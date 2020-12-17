import path from "path";

/**
 * Get the filename without ?hash
 * @param fileName file name
 */
export function getCanonicalFilename(fileName) {
  if (fileName.includes("?")) {
    return fileName.split("?").slice(0, -1).join("");
  }
  return fileName;
}

/**
 * Returns true if the filename is of types of one of the specified extensions
 * @param filename file name
 * @param extensions extensions
 */
export function isFileOfTypes(filename, extensions) {
  const extension = path.extname(getCanonicalFilename(filename));
  return extensions.includes(extension);
}
