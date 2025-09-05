// src/app/core/source-data.ts
export class SourceData {
  private static _data: any | null = null;  // cached data

  // Expose readonly getter
  static get data(): Readonly<any> | null {
    return this._data;
  }

  // Initialize from API (only once)
  static setData(data: any): void {
    if (!this._data) {
      this._data = Object.freeze(data); // freeze to prevent mutation
    }
  }

  // Helper to clone original data (for components to reset)
  static clone<T>(obj: T): T {
    return structuredClone(obj);
  }
}


SourceData.setData(data)),

xport class UserListComponent {
  users = SourceData.clone(SourceData.data?.users || []);

  reset() {
    this.users = SourceData.clone(SourceData.data?.users || []);
  }