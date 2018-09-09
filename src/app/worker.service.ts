import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import { WorkerMessage } from '../../worker/app-workers/shared/worker-message.model';

@Injectable()
export class WorkerService {
  public readonly workerPath = 'assets/workers/worker.main.bundle.js';

  workerUpdate$: Observable<WorkerMessage>;
  private worker: Worker;
  private workerSubject: Subject<WorkerMessage>;
  private workerMessageSubscription: Subscription;

  constructor() {
    this.workerInit();
  }

  doWork(workerMessage: WorkerMessage) {
    if (this.worker) {
      this.worker.postMessage(workerMessage);
    }
  }

  workerInit(): void {
    try {
      if (!!this.worker === false) {
        this.worker = new Worker(this.workerPath);
        this.workerSubject = new Subject<WorkerMessage>();
        this.workerUpdate$ = this.workerSubject.asObservable();

        this.workerMessageSubscription = Observable.fromEvent(this.worker, 'message')
          .subscribe((response: MessageEvent) => {
            if (this.workerSubject) {
              this.workerSubject.next(WorkerMessage.getInstance(response.data));
            }
          }, (error) => console.error('WORKER ERROR::', error));
      }
    } catch (exception) {
      console.error(exception);
    }
  }

}
