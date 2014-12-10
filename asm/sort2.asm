start
	mov $r0, #0
	ldr $r1, numItems
	mul $r1, $r1, #4
	mov $r2, #0
	add $r10, $r10, #4
loopStart
	mov $r0, #0
	sub $r1, $r1, #4
	bneq innerLoop, $r1, $r2
	jmp end
innerLoop
	bneq innerInnerLoop, $r0, $r1
	jmp loopStart
innerInnerLoop
	add $r3, $r0, $r10
	ldrn $r4, [$r0,array]
	ldrn $r5, [$r3,array]
	brc swap
branchBack
	add $r0, $r0, #4
	jmp innerLoop
swap
	blt branchBack, $r4, $r5
	strn $r4, [$r3,array]
	strn $r5, [$r0,array]
	jmp branchBack
end
	hlt
numItems
	.word 10
array
	.word 10,9,8,7,6,5,4,3,2,1