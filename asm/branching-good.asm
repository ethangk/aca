start
	mov $r0, #50
	mov $r1, #0
loopStart
	add $r2, $r2, #1
	add $r3, $r3, #1
	add $r4, $r4, #1
	add $r5, $r5, #1
	add $r6, $r6, #1
	add $r7, $r7, #1
	add $r8, $r8, #1
	add $r9, $r9, #1
	add $r10, $r10, #1
	add $r11, $r11, #1
	add $r12, $r12, #1
	add $r13, $r13, #1
	add $r14, $r14, #1
	add $r15, $r15, #1
	add $r16, $r16, #1
	add $r17, $r17, #1
	add $r18, $r18, #1
	add $r19, $r19, #1
	add $r20, $r20, #1
	sub $r0, $r0, #1
	bneq loopStart, $r0, $r1
end
	hlt
