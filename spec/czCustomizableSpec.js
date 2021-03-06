'use strict';


describe('cz-customizable', function() {

  var module, cz, commit;
  var rewire = require('rewire');

  beforeEach(function() {
    module = rewire('../index.js');

    module.__set__({
      // it mocks winston logging tool
      log: {
        info: function() {}
      },

      readConfigFile: function() {
        return {
          types: [{value: 'feat', name: 'feat: my feat'}],
          scopes: [{name: 'myScope'}],
          scopeOverrides: {
            fix: [{name: 'fixOverride'}]
          },
          allowCustomScopes: true,
          allowBreakingChanges: ['feat']
        };
      }
    });

    cz = jasmine.createSpyObj('cz', ['prompt', 'Separator']);
    commit = jasmine.createSpy();
  });

  function getMockedCz(answers) {
    return {
      prompt: function() {
        return {
          then: function (cb) {
            cb(answers);
          }
        };
      }
    };
  }

  it('should commit without confirmation', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      subject: 'do it all'
    };

    var mockCz = getMockedCz(answers);

    // run commitizen plugin
    module.prompter(mockCz, commit);

    expect(commit).toHaveBeenCalledWith('feat: do it all');
  });

  it('should escape special characters sush as backticks', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      subject: 'with backticks `here`'
    };

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);

    expect(commit).toHaveBeenCalledWith('feat: with backticks \\\\`here\\\\`');
  });

  it('should not call commit() function if there is no final confirmation and display log message saying commit has been canceled', function() {
    var mockCz = getMockedCz({});

    // run commitizen plugin
    module.prompter(mockCz, commit);

    expect(commit).not.toHaveBeenCalled();
  });

  it('should call commit() function with commit message when user confirms commit and split body when pipes are present', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      scope: 'myScope',
      subject: 'create a new cool feature',
      body: '-line1|-line2',
      breaking: 'breaking',
      footer: '#1, #2'
    };

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);

    expect(commit).toHaveBeenCalledWith('feat(myScope): create a new cool feature → #1, #2\n\n-line1\n-line2\n\nBREAKING CHANGE:\nbreaking\n\nCLOSES #1, CLOSES #2');
  });

  it('should call commit() function with commit message with the minimal required fields', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      scope: 'myScope',
      subject: 'create a new cool feature'
    };

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);
    expect(commit).toHaveBeenCalledWith('feat(myScope): create a new cool feature');
  });

  it('should suppress scope when commit type is WIP', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'WIP',
      subject: 'this is my work-in-progress'
    };

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);
    expect(commit).toHaveBeenCalledWith('WIP: this is my work-in-progress');
  });

  it('should allow edit message before commit', function(done) {
    process.env.EDITOR = 'true';

    var answers = {
      confirmCommit: 'edit',
      type: 'feat',
      subject: 'create a new cool feature'
    };

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);

    setTimeout(function() {
      expect(commit).toHaveBeenCalledWith('feat: create a new cool feature');
      done();
    }, 100);
  });

  it('should not commit if editor returned non-zero value', function(done) {
    process.env.EDITOR = 'false';

    var answers = {
      confirmCommit: 'edit',
      type: 'feat',
      subject: 'create a new cool feature'
    };

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);

    setTimeout(function() {
      expect(commit.wasCalled).toEqual(false);
      done();
    }, 100);
  });

  it('should truncate first line if number of characters is higher than 200', function() {
    var chars_100 = '0123456789-0123456789-0123456789-0123456789-0123456789-0123456789-0123456789-0123456789-0123456789-0123456789';

    // this string will be prepend: "CLOSES " = 15 chars
    var footerChars_100 = '0123456789-0123456789-0123456789-0123456789-0123456789-0123456789-0123456789-0123456789-012345';

    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      scope: 'myScope',
      subject: chars_100,
      body: chars_100 + ' body-second-line',
      footer: footerChars_100 + ' footer-second-line'
    };

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);

    var firstPart = 'feat(myScope): ';
    var firstLine = commit.mostRecentCall.args[0].split('\n\n')[0];
    expect(firstLine).toEqual(firstPart + answers.subject.slice(0, 70 - firstPart.length));

    //it should wrap body
    var body = commit.mostRecentCall.args[0].split('\n\n')[1];
    expect(body).toEqual(chars_100 + '\nbody-second-line');

    //it should wrap footer
    var footer = commit.mostRecentCall.args[0].split('\n\n')[2];
    expect(footer).toEqual('CLOSES ' + footerChars_100 + '\nfooter-second-line');

  });

  it('should call commit() function with custom breaking prefix', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      scope: 'myScope',
      subject: 'create a new cool feature → #my footer',
      breaking: 'breaking',
      footer: '#my footer'
    };
    
    module.__set__({
      // it mocks winston logging tool
      log: {
        info: function() {}
      },

      readConfigFile: function() {
        return {
          types: [{value: 'feat', name: 'feat: my feat → #my footer'}],
          scopes: [{name: 'myScope'}],
          scopeOverrides: {
            fix: [{name: 'fixOverride'}]
          },
          allowCustomScopes: true,
          allowBreakingChanges: ['feat'],
          breakingPrefix: 'WARNING:'
        };
      }
    });

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);

    expect(commit).toHaveBeenCalledWith('feat(myScope): create a new cool feature → #my footer\n\n\BREAKING CHANGE:\nbreaking\n\nCLOSES #my footer');
  });

  it('should call commit() function with custom footer prefix', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      scope: 'myScope',
      subject: 'create a new cool feature',
      breaking: 'breaking',
      footer: '#1'
    };
    
    module.__set__({
      // it mocks winston logging tool
      log: {
        info: function() {}
      },

      readConfigFile: function() {
        return {
          types: [{value: 'feat', name: 'feat: my feat → #1'}],
          scopes: [{name: 'myScope'}],
          scopeOverrides: {
            fix: [{name: 'fixOverride'}]
          },
          allowCustomScopes: true,
          allowBreakingChanges: ['feat'],
          footerPrefix: 'FIXES:'
        };
      }
    });

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);
    expect(commit).toHaveBeenCalledWith('feat(myScope): create a new cool feature → #1\n\nBREAKING CHANGE:\nbreaking\n\nFIXES: #1');
  });

  it('Should be able to use Pivotal Tag/Id', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      scope: 'myScope',
      subject: 'create a new cool feature',
      pivotalTag: 'Finishes',
      pivotalId: '109683958'
    };
    module.__set__({
      // it mocks winston logging tool
      log: {
        info: function() {}
      },

      readConfigFile: function() {
        return {
          pivotal: true,
          types: [{value: 'feat', name: 'feat: my feat → #my footer'}],
          scopes: [{name: 'myScope'}],
        };
      }
    });

    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);
    expect(commit.mostRecentCall.args[0]).toEqual('feat(myScope): create a new cool feature\n\n[Finishes #109683958]')
  });

  it('Should be able to use multiple Pivotal Story IDs', function() {
    var answers = {
      confirmCommit: 'yes',
      type: 'feat',
      scope: 'myScope',
      subject: 'create a new cool feature',
      pivotalTag: 'Delivers',
      pivotalId: '109683958, 209683958'
    };
    module.__set__({
      // it mocks winston logging tool
      log: {
        info: function() {}
      },

      readConfigFile: function() {
        return {
          pivotal: true,
          types: [{value: 'feat', name: 'feat: my feat → #my footer'}],
          scopes: [{name: 'myScope'}],
        };
      }
    });
    debugger
    var mockCz = getMockedCz(answers);
    module.prompter(mockCz, commit);
    debugger
    expect(commit.mostRecentCall.args[0]).toEqual('feat(myScope): create a new cool feature\n\n[Delivers #109683958], [Delivers #209683958]')
  });

});

