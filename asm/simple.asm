start
	mov $r0, #1
	mov $r1, #1
	mov $r2, #2
	mov $r3, #3
	mov $r4, #4
	mov $r5, #5
	mov $r6, #6
	mov $r7, #7
	mov $r8, #8
	mov $r9, #9
	add $r1, $r9, $r9
	str $r1, [$r0, #1]
	add $r3, $r4, $r4
	str $r2, [$r1, #2]
	str $r3, [$r2, #3]
	mov $r15, #14
	hlt