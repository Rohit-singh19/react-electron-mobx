const fs = window.require("fs");

const pako = window.require("pako");

interface ResultObject {
  [key: string]: any;
}

export default class FileStorage {
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async readFileChunked(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);
      const dataChunks: Buffer[] = [];

      readStream.on("error", (err: Error) => {
        reject(err);
      });

      readStream.on("data", (chunk: Buffer) => {
        dataChunks.push(chunk);
      });

      readStream.on("end", () => {
        const concatenatedData = Buffer.concat(dataChunks);
        resolve(concatenatedData);
      });
    });
  }

  async writeFileChunked(filePath: string, data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath, { encoding: "utf8" });

      writeStream.on("error", (error: Error) => {
        reject(error);
      });

      writeStream.on("finish", () => {
        resolve();
      });

      writeStream.write(data, "utf8");
      writeStream.end();
    });
  }

  async saveData(data: any): Promise<any> {
    try {
      const compressedData = pako.deflate(JSON.stringify(data));
      // fs.writeFileSync(this.filePath, compressedData, "utf8");
      await this.writeFileChunked(this.filePath, compressedData);
    } catch (error) {
      console.error("Error saving data to file:", error);
    }
  }

  async loadData(): Promise<any> {
    try {
      const startTime = performance.now();
      if (!fs.existsSync(this.filePath)) {
        return null;
      }

      const dataChunks = await this.readFileChunked(this.filePath);

      const decompressedData = pako.inflate(dataChunks, { to: "string" });

      const obj = JSON.parse(JSON.parse(decompressedData));

      let result: ResultObject = {};

      if (typeof obj !== "object") return obj;

      for (const [key, value] of Object.entries(obj)) {
        result[key] = JSON.parse(value as string);
      }
      const endTime = performance.now();

      console.log("reading Time:::", endTime - startTime);
      return result;
    } catch (error) {
      console.log("Error loading data from file:", error);
      return null;
    }
  }
}
