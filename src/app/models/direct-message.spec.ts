import { messageTree } from './direct-message';

describe('DirectChat', () => {
  it('should create an instance', () => {
    expect(new messageTree()).toBeTruthy();
  });
});
