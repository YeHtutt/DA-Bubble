import { Pipe, PipeTransform } from '@angular/core';


/**
 * This pipe is used to filter and rearrange an array of users such that the current user's name 
 * is positioned at the beginning of the array, if present.
 * 
 * @Pipe Decorator that declares a pipe and specifies its name.
 */
@Pipe({
  name: 'filterBy'
})
export class FilterPipe implements PipeTransform {


  /**
  * Transforms the input array of users by positioning the current user's name at the start.
  * If the current user's name is not in the array, it returns the array unchanged.
  * 
  * @param {any[]} users - The array of user names to be transformed.
  * @param {string} currentUserName - The current user's name.
  * @returns {any[]} - The transformed array with the current user's name at the start, if present.
  */
  transform(users: any[], currentUserName: string) {
    if (users.includes(currentUserName)) {
      const filteredUsers = users.filter(user => user !== currentUserName);
      filteredUsers.unshift(currentUserName);
      return filteredUsers;
    } else {
      return users;
    }
  }
}
