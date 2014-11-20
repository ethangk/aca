start
	mov $r0, #0
	ldr $r1, numItems
	mov $r2, #0
	mov $r10, #1
loopStart
	mov $r0, #0
	sub $r1, $r1, #1
	beq end, $r1, $r2
innerLoop
	beq loopStart, $r0, $r1
	add $r3, $r0, $r10
	ldr $r4, [array, $r0]
	ldr $r5, [array, $r3]
	brc swap
	add $r0, $r0, #1
	jmp innerLoop
end
	hlt
swap
	blt $r30, $r4, $r5
	str $r4, [array, $r3]
	str $r5, [array, $r0]
	jmp $r30
numItems
	.word 14
array
	.word 15,22, 3, 19, 55, 11, 23, -4, 5, 6, 14, 15, 23, 55