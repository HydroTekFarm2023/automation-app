import { PowerOutlet } from "./../models/power-outlet.model";
import { ValidatorFn, FormGroup } from "@angular/forms";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ReservoirValidator {
  public ReservoirVal(
    isControl: string,
    powerOutlets: PowerOutlet[]
  ): ValidatorFn {
    let validatorCounter = 0;
    return (form: FormGroup) => {
      console.warn(form);
      const controlVal: boolean = form.get(isControl).value;
      if (controlVal == true) {
        console.warn("isEnabled");
        //enabled: all other default validators function normally. We still need to check for the power outlets
        if (powerOutlets) {
          //make sure we have an array to check with
          //We need something to trigger the validators here, and only once
          //How do we have persistent storage?
          validatorCounter++;
          console.warn(validatorCounter)
          if (validatorCounter == 1) {
            form.get("replace_date").updateValueAndValidity();
            form.get("replace_interv").updateValueAndValidity();
            form.get("reservoir_size").updateValueAndValidity();
          }
          //Else, don't validate - already checked once.
          if (
            this.isPowerOutletSetup("Reservoir Water In", powerOutlets) &&
            this.isPowerOutletSetup("Reservoir Water Out", powerOutlets)
          ) {
            return null;
          } else {
            return { powerOutletNotSetup: true };
          }
        }
      } else if (controlVal == false) {
        validatorCounter = 0;
        console.warn("isDisabled");
        //clear all (not enabled, so we don't care if there are errors)
        form.get("replace_date").setErrors(null);
        form.get("replace_interv").setErrors(null);
        form.get("reservoir_size").setErrors(null);
        form.markAsDirty(); //get rid of error UI effects
        return null;
      }
    };
  }

  private isPowerOutletSetup(
    name: string,
    powerOutlets: PowerOutlet[]
  ): boolean {
    for (var i = 0; i < powerOutlets.length; i++) {
      if (powerOutlets[i].name == name) {
        return true;
      }
    }
    return false;
  }
}
