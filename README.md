# jQuery slideToucher plugin

## About

Touch screen jQuery slide/swipe plugin with vertical as well as horizontal swipe support.

### Just run as:

```
	$("#slides").slideToucher({
		vertical: true,
		horizontal: true
	});
```

### Required markup:

Currently it is relying on **.slide** and **.row** classes. But I will make it optional soon. Elements don't have to be as mine

```
<section id="slides">
		<div class="row">
			<article class="slide"></article>
			<article class="slide"></article>
			<article class="slide"></article>
			<article class="slide"></article>
		</div>	
		<div class="row">
			<article class="slide"></article>
			<article class="slide"></article>
			<article class="slide"></article>
			<article class="slide"></article>
		</div>
		<div class="row">
			<article class="slide"></article>
			<article class="slide"></article>
			<article class="slide"></article>
			<article class="slide"></article>
		</div>		
	</section>
```	

## Demo

<a target="_blank" href="http://yuripetusko.github.com/slideToucher/">http://yuripetusko.github.com/slideToucher/</a>

## Credits

Plugin is loosely based on tutorial by Martin Kool https://twitter.com/mrtnkl
http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/

Also borrowed very clever way iScroll plugin works out your vendor prefix.
Credits to Matteo Spinelli, http://cubiq.org

## Licence

The MIT License (MIT)
Copyright (c) 2013 Jurijs Petusko | Yuri Petusko | yuripetusko@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.