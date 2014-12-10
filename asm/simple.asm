start
	mov $r0, #100
	mov $r1, #100
	mov $r2, #200
	mov $r3, #300
	beq end, $r2, $r0
	mov $r2, $r3
	mov $r4, #400
	mov $r5, #500
end
	mov $r6, #600
	mov $r7, #700
	mov $r8, #800
	mov $r9, #900
	hlt