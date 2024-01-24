# DaBubble

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Angular Fire Backend help

To add Angular Fire to project run `ng add @angular/fire`.
Code example for the manual import of Angular Fire
```
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

@NgModule({
  imports: [
    provideFirebaseApp(() => initializeApp({ environment.firebaseConfig })),
    provideFirestore(() => getFirestore()),
  ],
  ...
})
export class AppModule { }
```
Edit the Firebase environment in `environment.ts` with your own Firebase backend configuration. For further more Firebase help go check out the [Github Angular Quickstart Page](https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md)
