import Foo from '../src/js/index.es6';

describe("After defining some global objects", function () {
  it("should have some definied some global objects", () => {
    expect(datastore).toBeDefined();
    expect(drawer).toBeDefined();
    expect(ui).toBeDefined();
  });
});
