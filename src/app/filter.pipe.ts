import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy'
})
export class FilterPipe implements PipeTransform {


  transform(users: any[], currentUserName: string) {
    const filteredUsers = users.filter(user => user !== currentUserName);
    filteredUsers.unshift(currentUserName);
    return filteredUsers;
  }

}
