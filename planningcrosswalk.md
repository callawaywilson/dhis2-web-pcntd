# Import Drug/Disease Mapping
#ntddb

## NTD Treatments from Drugs Distributed
`#NTD(#Intervention)` is the decision whether or not to treat that NTD with the intervention in the district.  1 if true, 0 if false.

### LF Treatments 
```
LF(IVM+ALB) + LF(DEC+ALB) + LF(IVM+DEC+ALB) + LF(IVM+ALB+PZQ)
```

### Oncho Treatments 
```
Oncho(IVM+ALB) + Oncho(IVM+DEC+ALB) + Oncho(IVM) + Oncho(IVM+ALB+PZQ)
```

### STH Treatments
```
STH(IVM+ALB) + STH(DEC+ALB) + STH(IVM+DEC+ALB) + STH(ALB) + STH(MBD) + STH(PZQ+MBD) + STH(PZQ+ALB) + STH(IVM+ALB+PZQ)
```

### SCH Treatments
``` 
SCH(PZQ) + STH(PZQ+MBD) + STH(PZQ+ALB) + STH(IVM+ALB+PZQ)
```

### Trachoma Treatments
```
AzTabs + AzOral + TEO 
```

## Intervention Treatments from NTD Treatments (JAP Generation)
`#<NTD>` is number treated / for NTD 

`max()` function is expressible in DHIS2 with the arithmetic by chaining the following function:
```
max(a,b) = 1/2 * (a + b + |a − b|)
```

### MDA1 - IVM+ALB
```
max(
  #LF * LF(IVM+ALB), 
  #Oncho * Oncho(IVM+ALB), 
  #STH * STH(IVM+ALB)
)
```

### MDA2 - DEC+ALB
```
max(
  #LF * LF(DEC+ALB),
  #STH * STH(DEC+ALB)
)
```

### MDA3 - IVM
```
#Oncho * Oncho(IVM)
```

### T1 - PZQ+ALB
```
max(
  #STH * STH(PZQ+ALB),
  #SCH * SCH(PZQ+ALB)
)
```

### T1 - PZQ+MBD
```
max(
  #STH * STH(PZQ+MBD),
  #SCH * SCH(PZQ+MBD)
)
```

### T2  - PZQ
```
#SCH * SCH(PZQ)
```

### T3 - ALB
```
#STH * STH(ALB)
```

### T3 - MBD
```
#STH * STH(MBD)
```

Note, T3 is 2x a year (2 rounds) if loa loa co-endemic, which means `#STH` may aggregate, and 2 quarterly dates are necessary for JRF generation (T3_R1, T3_R2) tabs. 

## Calculate Treatment Strategy from NTDs treated


## Calculate Treatment Strategy from JRF:
`R(<NTD>)` is rounds of treatments planned for the year

Quarterly calculation for each woreda:
```
if r(LF) > 1
  if r(Oncho) > 1
    if r(STH) > 1
      if r(SCH) > 1     // LF + Oncho + STH + SCH
        LF(IVM+ALB) // MDA1
        Oncho(IVM+ALB) // MDA1
        if T1
          STH(PZQ+MBD) || STH(PZQ+ALB) // T1, ALB or MBD
          SCH(PZQ+MBD) || SCH(PZQ+ALB) // T1, ALB or MBD
        else if T2
          STH(PZQ) // T2
          SCH(PZQ) // T2
        end
      else if r(SCH) < 1 // LF + Oncho + STH
        LF(IVM+ALB) // MDA1
        Oncho(IVM+ALB) // MDA1
        if T3_R1 or T3_R2 
          STH(ALB) || STH(MBD) // T3, ALB or MBD
        else
          STH(IVM+ALB) // MDA1
        end
      end
    else if r(STH) < 1
      if r(SCH) > 1   // LF + Oncho + SCH
        LF(IVM+ALB) // MDA1
        Oncho(IVM+ALB) // MDA1
        SCH(PZQ) // T2
      else if r(SCH) < 1  // LF + Oncho
        LF(IVM+ALB)
        Oncho(IVM+ALB)
      end
    end
  else if r(Oncho) < 1
    if r(STH) > 1
      if r(SCH) > 1   // LF + STH + SCH
        LF(IVM+ALB) // MDA1
        if T1
          STH(PZQ+MBD) || STH(PZQ+ALB) // T1, ALB or MBD
          SCH(PZQ+MBD) || SCH(PZQ+ALB) // T1, ALB or MBD
        else if T2
          STH(PZQ) // T2
          SCH(PZQ) // T2
        end
      else if r(SCH) < 1 // LF + STH
        LF(IVM+ALB) // MDA1
        if T3_R1 or T3_R2 
          STH(ALB) || STH(MBD) // T3, ALB or MBD
        else
          STH(IVM+ALB) // MDA1
        end
      end
    else if r(STH) < 1
      if r(SCH) > 1   // LF + SCH
        LF(IVM+ALB) // MDA1
        SCH(PZQ)  // T2
      else if r(SCH) < 1  // LF
        LF(IVM+ALB)
      end
    end
  end 
else if r(LF) < 1
  if r(Oncho) > 1
    if r(STH) > 1
      if r(SCH) > 1   // Oncho + STH + SCH
        Oncho(IVM+ALB) // MDA1
        if T1
          STH(PZQ+MBD) || STH(PZQ+ALB) // T1, ALB or MBD
          SCH(PZQ+MBD) || SCH(PZQ+ALB) // T1, ALB or MBD
        else if T2
          STH(IVM+ALB) // MDA1
          SCH(PZQ) // T2
        end
      else if r(SCH) < 1  // Oncho + STH
        Oncho(IVM+ALB) // MDA1
        if T3
          STH(ALB) || STH(MBD) // T3, ALB or MBD
        else
          STH(IVM+ALB) // MDA1
        end
      end
    else if r(STH) < 1
      if r(SCH) > 1   // Oncho + SCH
        Oncho(IVM) // MDA3
        SCH(PZQ) // T2
      else if r(SCH) < 1  // Oncho
        Oncho(IVM) // MDA3
      end
    end
  else if r(Oncho) < 1
    if r(STH) > 1
      if r(SCH) > 1   // STH + SCH
        SCH(PZQ+ALB) || SCH(PZQ+MBD) // T1, ALB or MBD
        else if T3_R1 or T3_R2
          STH(ALB) || ATH(MBD) // T3, ALB or MBD
        else
          STH(PZQ+ALB) || STH(PZQ+MBD) // T1, ALB or MBD
        end
      else if r(SCH) < 1  // STH
        STH(ALB) || ATH(MBD) // T3, ALB or MBD
      end
    else if r(STH) < 1    
      if r(SCH) > 1   // SCH
        SCH(PZQ) // T2
      else if r(SCH) < 1 // Disease-free!
        // No treatments
      end
    end
  end 
end
```

## Historical Import Strategy
### Update mapping for JRF to import:
1. **Annual**  Wordeda PC Strategy info for NTD -> PC Intervention 1/0
  * `pcn-treatment-strategy` for import year
  * `pcn-rounds-planned` for import year
2. **Quarterly** Disease specific treatment numbers
  * `pcn-pop-trgt`  Population targeted, for quarter where treatment date lies
    * <PCNTD>-<age>-<sex>
    * pc-ntd-<lf,ov,sth,sch>-age-<adult,sac,presac,unknown>-sex-<male,female,unknown>
  * `pcn-pop-trt`  Population treated, for quarter where treatment data lies
    * <PCNTD>-<age>-<sex>
    * pc-ntd-<lf,ov,sth,sch>-age-<adult,sac,presac,unknown>-sex-<male,female,unknown>
