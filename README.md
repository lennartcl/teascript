# TeaScript

TeaScript is an experimental transformation tool that adds type annotations,
ES2015, React, and what not, to JavaScript. Instead of relying on a compilation
step, TeaScript is designed to be integrated into an editor, always saving plain
old JavaScript to disk.

For example, when your editor shows JavaScript with type annotations

```javascript
function repeat(s : string, n : number) : void {
    return // ...
}
```

on disk it will actually look like:

```javascript
function repeat(s /*: string*/, n /*: number*/) /*: void*/ {
    return // ...
}
```

Got some ES6 got with classes?

```javascript
class Foo {
    constructor(foo, bar) {
        this.foo = foo;
        this.bar = bar;
    }
    
    getFoo() {
        return foo;
    }
}
```

on disk TeaScript can store it as legal ES5 code with annotations:
 
```javascript
/*+class Foo {*/
/**+constructor(foo, bar) {*/function Foo(foo, bar) {"use strict";
        this.foo = foo;
        this.bar = bar;
    }
    
/**+getFoo() {*/Object.defineProperty(Foo.prototype,"getFoo",{writable:true,configurable:true,value:function() {"use strict";
        return foo;
    }
/*+}*/
```

TeaScript simply turns all JavaScript extensions into annotations
in comments, and can translate it back to the original form on the fly.
This way, editors always see the extended version and can provide
better code completion and what not. And build tools, debuggers,
packagers, etc. still work since they see pure JavaScript.

## Command-line Use

Output plain JavaScript for a file:

```
teascript -c simple.js
```

Restore extended JavaScript from stdin:

```
echo "function foo() /*: void*/ {}" | teascript -d
```

Output plain JavaScript for a React module:

```
teascript --react -c react.jsx
```