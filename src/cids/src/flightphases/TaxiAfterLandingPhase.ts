import { FlightPhase } from './FlightPhase';

/**
 * Possible next flight phases:
 * 1. DISEMBARKATION
 * 2. AFTER DISEMBARKATION
 */
export class TaxiAfterLandingPhase extends FlightPhase {
    private nextFlightPhases: FlightPhase[];

    public init(...flightPhases: FlightPhase[]) {
        this.nextFlightPhases = flightPhases;
    }

    public tryTransition(): void {
        this.nextFlightPhases.forEach((current) => {
            console.log(`Attempting to transition to FP${current.getValue()}.`);
            if (current.testConditions()) {
                console.log(`Sending FP${current.getValue()} to manager.`);
                this.sendNewFlightPhaseToManager(current);
            }
        });
    }

    public testConditions(): boolean {
        return (
            this.flightPhaseManager.cids.onGround()
            && this.flightPhaseManager.cids.groundSpeed() < 80
        );
    }

    public getValue(): number {
        return 10;
    }
}
