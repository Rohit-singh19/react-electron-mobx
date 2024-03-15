// Timer.ts
import { makeAutoObservable, toJS, action } from "mobx";
import FileStorage from "./FileStorage";

interface IndexingData {
  localFiles: LocalFile[];
  // Other properties if applicable
}

interface LocalFile {
  data: any[]; // Replace 'any' with the actual type of 'data'
  // Other properties if applicable
}

export class Timer {
  secondsPassed = 0;
  storage: FileStorage;
  filePath =
    "C:\\Users\\Rohit Singh\\Downloads\\redux-storage - Copy\\indexing.lz";
  indexingData: IndexingData | null = null;

  constructor() {
    this.storage = new FileStorage(this.filePath);
    this.loadData();
    makeAutoObservable(this);
  }

  async loadData() {
    try {
      const savedData = await this.storage.loadData();

      this.setIndexingData(savedData);

      if (savedData !== null && typeof savedData.secondsPassed === "number") {
        this.secondsPassed = savedData.secondsPassed;
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  @action setIndexingData(data: IndexingData | null) {
    this.indexingData = toJS(data);
  }

  // increaseTimer() {
  //   this.secondsPassed += 1;
  //   this.saveData();
  // }

  // decreaseTimer() {
  //   if (this.secondsPassed > 0) {
  //     this.secondsPassed -= 1;
  //     this.saveData();
  //   }
  // }

  saveData() {
    this.storage.saveData({ secondsPassed: this.secondsPassed });
  }
}
