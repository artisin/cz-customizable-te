# cz-customizable

__NOTE__: Same as [cz-customizable](https://github.com/leonardoanalista/cz-customizable), but with the commit tailored to my liking and to jive with [waffle.io](https://waffle.io).

The customizable Commitizen plugin to help achieve consistent commit messages like the [AngularJS team](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#-git-commit-guidelines).

![screenshot](screenshot.png)

Suitable for large teams working with multiple projects with their own commit scopes. When you specify the scopes in your `.cz-config.js`, `cz-customizable` allows you to **select** the pre-defined scopes. No more spelling mistakes embarrassing you when generating the changelog file.



## Steps:
* install commitizen in case you don't have it: `npm install -g commitizen`. Make sure you have the latest version of commitizen installed globally.
* install the cz-customizable: `npm install cz-customizable --save-dev`
* configure `commitizen` to use `cz-customizable` as plugin. Add those lines to your `package.json`:

  ```
  ...
  "config": {
    "commitizen": {
      "path": "node_modules/cz-customizable"
    }
  }
  ```

## You have two options to configure `cz-customizable`:
* Config block in your `package.json`:
  ```
  ...
  "config": {
    "commitizen": {
      "path": "node_modules/cz-customizable"
    },
    "cz-customizable": {
      "config": "config/path/to/my/config.js"
    }
  }
  ```
Note: option one allows you to have your config away from root directory. It also gives you a change to define any name to your `cz-config.js`.


**Notes:**
* you should commit your `.cz-config.js` file to your git.


From now on, instead of `git commit` you type `git cz` and let the tool do the work for you.

Hopefully this will help you to have consistent commit messages and have a fully automated deployemnt without any human intervention.

## Options

Here are the options you can set in your `.cz-config.js`:

* scopes: {Array of Strings}: Specify the scopes for your particular project. Eg.: for some banking system: ["acccounts", "payments"]. For another travelling application: ["bookings", "search", "profile"]
* scopeOverrides: {Object where key contains a Array of String}: Use this when you want to override scopes for a specific commit type. Example bellow specify scopes when type is `fix`:
```
  scopeOverrides: {
    fix: [
      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  }
  ```
  * allowCustomScopes: {boolean, default false}: adds the option `custom` to scope selection so you can still typea scope if you need.
  * allowBreakingChanges: {Array of Strings: default none}. List of commit types you would like to the question `breaking change` prompted. Eg.: ['feat', 'fix']
  * appendBranchNameToCommitMessage: If you use `cz-customizable` with `cz-customizable-ghooks`, you can get the branch name automatically appended to the commit message. This is done by a commit hook on `cz-customizable-ghooks`. This option has been added on `cz-customizable-ghooks`, v1.3.0. Default value is `true`.

## Related tools:
- (https://github.com/commitizen/cz-cli)
- (https://github.com/stevemao/conventional-recommended-bump)
- (https://github.com/semantic-release/semantic-release)
- (https://github.com/uglow/cz-customizable-ghooks)



## GOTCHAS

* backticks
If you wish to have backticks in your content, for example "feat: \`string\`", the commit preview will be "feat: \\\\`string\\\\`".
Don't worry because on your `git log` will be "feat: \`string\`" as desired.

* multiline contents on the body of the message
Body is the only place where you can use a `pipe` to break lines.
E.g.: you type this: `my items are:| - item01| - item 02`, which will become:


```
my items are:
 - item01
 - item 02
```


## CONTRIBUTING

Please refer to:
* [Contributor Guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md) - disregard section "Signing the CLA"
* [Conduct of Code](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md) from [AngularJs](https://github.com/angular/angular.js) project.



Leonardo Correa
