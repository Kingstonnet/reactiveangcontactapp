import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AccordionState {
  id: string;                 // e.g. "personal-info"
  data: any;                  // actual form data
  valid: boolean;             // validity status
}

@Injectable({ providedIn: 'root' })
export class AccordionStateService {
  private accordionStates = new Map<string, BehaviorSubject<AccordionState>>();

  // Initialize or get existing subject
  private getSubject(id: string): BehaviorSubject<AccordionState> {
    if (!this.accordionStates.has(id)) {
      this.accordionStates.set(id, new BehaviorSubject<AccordionState>({
        id,
        data: null,
        valid: false,
      }));
    }
    return this.accordionStates.get(id)!;
  }

  // Update accordion state
  updateState(id: string, data: any, valid: boolean) {
    this.getSubject(id).next({ id, data, valid });
  }

  // Subscribe to changes of a specific accordion
  watchState(id: string) {
    return this.getSubject(id).asObservable();
  }

  // Get current value
  getStateValue(id: string): AccordionState | undefined {
    return this.accordionStates.get(id)?.value;
  }
}


@Component({
  selector: 'app-accordion-a',
  templateUrl: './accordion-a.component.html',
})
export class AccordionAComponent implements OnInit {
  form = this.fb.group({
    name: ['', Validators.required],
    age: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private stateService: AccordionStateService) {}

  ngOnInit() {
    this.form.valueChanges.subscribe(() => {
      this.stateService.updateState('accordionA', this.form.value, this.form.valid);
    });
  }
}

@Component({
  selector: 'app-accordion-b',
  templateUrl: './accordion-b.component.html',
})
export class AccordionBComponent implements OnInit, OnDestroy {
  form = this.fb.group({
    address: ['', Validators.required],
    city: ['', Validators.required],
  });

  private sub?: Subscription;

  constructor(private fb: FormBuilder, private stateService: AccordionStateService) {}

  ngOnInit() {
    // Watch for changes in Accordion A
    this.sub = this.stateService.watchState('accordionA').subscribe((state) => {
      if (state.valid && state.data) {
        // You can prefill or enable this form
        console.log('Accordion A is valid and filled:', state.data);
        this.form.enable();
      } else {
        // Accordion A invalid or cleared → reset or disable
        console.warn('Accordion A invalid, disabling Accordion B');
        this.form.reset();
        this.form.disable();
      }
    });

    // Publish this form's state too
    this.form.valueChanges.subscribe(() => {
      this.stateService.updateState('accordionB', this.form.value, this.form.valid);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
// In parent component
checkGlobalValidation() {
  const a = this.stateService.getStateValue('accordionA');
  const b = this.stateService.getStateValue('accordionB');

  if (b?.valid && (!a || !a.valid)) {
    // Invalid case: B depends on A but A invalid
    return { dependencyError: 'Accordion B depends on A, but A invalid' };
  }
  return null;
}

🧠 4️⃣ Behavior Summary
Action	Result
User fills Accordion A	Service updates → Accordion B sees valid: true and enables its form
User clears Accordion A	Service updates → Accordion B resets or disables
User modifies Accordion B	Service tracks its validity and data
Global validation	Parent or service can validate dependency integrity
