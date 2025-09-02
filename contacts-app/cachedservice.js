Common Service (with caching)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private cache: { [key: string]: Observable<any> } = {};

  constructor(private http: HttpClient) {}

  /**
   * Get dropdown data from API or cache
   * @param endpoint API URL
   */
  getDropdownData(endpoint: string): Observable<any> {
    if (!this.cache[endpoint]) {
      // First time call → fetch from API and cache it
      this.cache[endpoint] = this.http.get(endpoint).pipe(
        shareReplay(1) // keep one copy in cache
      );
    }
    return this.cache[endpoint];
  }

  /**
   * Clear cache (optional, e.g., on logout or refresh logic)
   */
  clearCache(endpoint?: string): void {
    if (endpoint) {
      delete this.cache[endpoint];
    } else {
      this.cache = {};
    }
  }
}


import { Component, OnInit } from '@angular/core';
import { DropdownService } from '../services/dropdown.service';

@Component({
  selector: 'app-child',
  template: `
    <select>
      <option *ngFor="let item of dropdownValues" [value]="item.id">
        {{ item.name }}
      </option>
    </select>
  `
})
export class ChildComponent implements OnInit {
  dropdownValues: any[] = [];

  constructor(private dropdownService: DropdownService) {}

  ngOnInit(): void {
    this.dropdownService.getDropdownData('/api/dropdown-values')
      .subscribe(data => {
        this.dropdownValues = data;
      });
  }
}


//mutiple drop downs.
import { Component, OnInit } from '@angular/core';
import { DropdownService } from '../services/dropdown.service';

@Component({
  selector: 'app-child',
  template: `
    <label>Country:</label>
    <select>
      <option *ngFor="let c of countries" [value]="c.id">{{ c.name }}</option>
    </select>

    <label>State:</label>
    <select>
      <option *ngFor="let s of states" [value]="s.id">{{ s.name }}</option>
    </select>
  `
})
export class ChildComponent implements OnInit {
  countries: any[] = [];
  states: any[] = [];

  constructor(private dropdownService: DropdownService) {}

  ngOnInit(): void {
    // Dropdown A - Countries
    this.dropdownService.getDropdownData('/api/countries')
      .subscribe(data => this.countries = data);

    // Dropdown B - States
    this.dropdownService.getDropdownData('/api/states')
      .subscribe(data => this.states = data);
  }
}
