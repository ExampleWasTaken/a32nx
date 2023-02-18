import { Manager } from './Manager';
import { Cids } from '../CidsConstants';
import { Director } from '../directors/Director';
import { AfterDisembarkationPhase } from '../../flightphases/AfterDisembarkationPhase';
import { ApproachPhase } from '../../flightphases/ApproachPhase';
import { BoardingPhase } from '../../flightphases/BoardingPhase';
import { CruisePhase } from '../../flightphases/CruisePhase';
import { DisembarkationPhase } from '../../flightphases/DisembarkationPhase';
import { FinalApproachAndLandingPhase } from '../../flightphases/FinalApproachAndLandingPhase';
import { FinalClimbPhase } from '../../flightphases/FinalClimbPhase';
import { FlightPhase } from '../../flightphases/FlightPhase';
import { PushbackPhase } from '../../flightphases/PushbackPhase';
import { TakeoffAndInitialClimbPhase } from '../../flightphases/TakeoffAndInitialClimbPhase';
import { TaxiAfterLandingPhase } from '../../flightphases/TaxiAfterLandingPhase';
import { TaxiBeforeTakeoffPhase } from '../../flightphases/TaxiBeforeTakeoffPhase';
import { TopOfDescentPhase } from '../../flightphases/TopOfDescentPhase';

export class FlightPhaseManager implements Manager {
    public readonly director: Director;

    public readonly directorId: DirectorId;

    private readonly boardingPhase: BoardingPhase;

    private readonly pushbackPhase: PushbackPhase;

    private readonly taxiBeforeTakeoffPhase: TaxiBeforeTakeoffPhase;

    private readonly takeoffAndInitialClimbPhase: TakeoffAndInitialClimbPhase;

    private readonly finalClimbPhase: FinalClimbPhase;

    private readonly cruisePhase: CruisePhase;

    private readonly todPhase: TopOfDescentPhase;

    private readonly apprPhase: ApproachPhase;

    private readonly finalApprAndLandingPhase: FinalApproachAndLandingPhase;

    private readonly taxiAfterLandingPhase: TaxiAfterLandingPhase;

    private readonly disembarkationPhase: DisembarkationPhase;

    private readonly afterDisembarkationPhase: AfterDisembarkationPhase;

    constructor(director: Director, directorId: DirectorId) {
        this.director = director;
        this.directorId = directorId;
        this.boardingPhase = new BoardingPhase(this);
        this.pushbackPhase = new PushbackPhase(this);
        this.taxiBeforeTakeoffPhase = new TaxiBeforeTakeoffPhase(this);
        this.takeoffAndInitialClimbPhase = new TakeoffAndInitialClimbPhase(this);
        this.finalClimbPhase = new FinalClimbPhase(this);
        this.cruisePhase = new CruisePhase(this);
        this.todPhase = new TopOfDescentPhase(this);
        this.apprPhase = new ApproachPhase(this);
        this.finalApprAndLandingPhase = new FinalApproachAndLandingPhase(this);
        this.taxiAfterLandingPhase = new TaxiAfterLandingPhase(this);
        this.disembarkationPhase = new DisembarkationPhase(this);
        this.afterDisembarkationPhase = new AfterDisembarkationPhase(this);
    }

    public init(): void {
        console.log(`[CIDS/FPM${this.directorId}] Initialization started...`);

        this.initFlightPhases();

        this.initActiveFlightPhase();
    }

    public update(): void {
        this.getActiveFlightPhase().tryTransition();
    }

    // TODO: merge 'getActiveFlightPhase' and 'getFlightPhaseById'
    // eslint-disable-next-line consistent-return
    public getActiveFlightPhase(): FlightPhase {
        const flightPhase = this.getFlightPhaseById(SimVar.GetSimVarValue(Cids.SimVar.FLIGHT_PHASE, 'Enum'));
        // eslint-disable-next-line default-case
        switch (flightPhase.getValue()) {
        case 1:
            return this.boardingPhase;
        case 2:
            return this.pushbackPhase;
        case 3:
            return this.taxiBeforeTakeoffPhase;
        case 4:
            return this.takeoffAndInitialClimbPhase;
        case 5:
            return this.finalClimbPhase;
        case 6:
            return this.cruisePhase;
        case 7:
            return this.todPhase;
        case 8:
            return this.apprPhase;
        case 9:
            return this.finalApprAndLandingPhase;
        case 10:
            return this.taxiAfterLandingPhase;
        case 11:
            return this.disembarkationPhase;
        case 12:
            return this.afterDisembarkationPhase;
        default:
            console.dir(flightPhase);
            throw new Error('Invalid current flight phase');
        }
    }

    public getFlightPhaseById(id: number): FlightPhase {
        switch (id) {
        case 1:
            return this.boardingPhase;
        case 2:
            return this.pushbackPhase;
        case 3:
            return this.taxiBeforeTakeoffPhase;
        case 4:
            return this.takeoffAndInitialClimbPhase;
        case 5:
            return this.finalClimbPhase;
        case 6:
            return this.cruisePhase;
        case 7:
            return this.todPhase;
        case 8:
            return this.apprPhase;
        case 9:
            return this.finalApprAndLandingPhase;
        case 10:
            return this.taxiAfterLandingPhase;
        case 11:
            return this.disembarkationPhase;
        case 12:
            return this.afterDisembarkationPhase;
        default:
            throw new Error(`[CIDS/FPM${this.directorId}] Invalid flight phase! Flight phase ${id} does not exist!`);
        }
    }

    public setActiveFlightPhase(flightPhase: FlightPhase): void {
        const prevPhase = this.getActiveFlightPhase();

        this.director.output(
            Cids.SimVar.FLIGHT_PHASE,
            'Enum',
            flightPhase.getValue(),
            () => console.log(`[CIDS] Flight phase: ${prevPhase.getValue()} => ${flightPhase.getValue()}`),
        );

        if (Cids.DEBUG) {
            SimVar.SetSimVarValue(`L:A32NX_CIDS_DEBUG_DIR_${this.directorId}_FLIGHT_PHASE`, 'Enum', flightPhase.getValue())
                .then(() => console.log(`[CIDS/DIR${this.directorId}] Set debug flight phase to: ${prevPhase.getValue()} => ${flightPhase.getValue()}`));
        }
    }

    private initFlightPhases(): void {
        console.log(`[CIDS/FPM${this.directorId}] Initializing flight phases...`);

        this.boardingPhase.init(this.pushbackPhase, this.taxiBeforeTakeoffPhase, this.disembarkationPhase);
        this.pushbackPhase.init(this.taxiBeforeTakeoffPhase, this.disembarkationPhase);
        this.taxiBeforeTakeoffPhase.init(this.takeoffAndInitialClimbPhase, this.disembarkationPhase);
        this.takeoffAndInitialClimbPhase.init(this.finalClimbPhase, this.cruisePhase, this.finalApprAndLandingPhase, this.disembarkationPhase);
        this.finalClimbPhase.init(this.cruisePhase, this.finalApprAndLandingPhase);
        this.cruisePhase.init(this.todPhase, this.apprPhase);
        this.todPhase.init(this.apprPhase);
        this.apprPhase.init(this.finalApprAndLandingPhase);
        this.finalApprAndLandingPhase.init(this.taxiAfterLandingPhase);
        this.taxiAfterLandingPhase.init(this.disembarkationPhase, this.afterDisembarkationPhase);
        this.disembarkationPhase.init(this.afterDisembarkationPhase);
        this.afterDisembarkationPhase.init(this.boardingPhase, this.pushbackPhase, this.taxiBeforeTakeoffPhase);
    }

    private initActiveFlightPhase(): void {
        console.log(`[CIDS/FPM${this.directorId}] Initializing active flight phase...`);
        const startState = SimVar.GetSimVarValue('L:A32NX_START_STATE', 'Enum');
        switch (startState) {
        case 1:
        case 2:
            this.director.output(
                Cids.SimVar.FLIGHT_PHASE,
                'Enum',
                this.afterDisembarkationPhase.getValue(),
                () => console.log(`[CIDS/FPM${this.directorId}] Initial flight phase: ${this.afterDisembarkationPhase.getValue()}`),
                true,
            );
            if (Cids.DEBUG) {
                SimVar.SetSimVarValue(`L:A32NX_CIDS_DEBUG_DIR_${this.directorId}_FLIGHT_PHASE`, 'Enum', this.afterDisembarkationPhase.getValue());
            }
            break;
        case 3:
        case 4:
            this.director.output(
                Cids.SimVar.FLIGHT_PHASE,
                'Enum',
                this.taxiBeforeTakeoffPhase.getValue(),
                () => console.log(`[CIDS/FPM${this.directorId} Initial flight phase: ${this.taxiBeforeTakeoffPhase.getValue()}`),
                true,
            );
            if (Cids.DEBUG) {
                SimVar.SetSimVarValue(`L:A32NX_CIDS_DEBUG_DIR_${this.directorId}_FLIGHT_PHASE`, 'Enum', this.taxiBeforeTakeoffPhase.getValue());
            }
            break;
        case 5:
            this.director.output(
                Cids.SimVar.FLIGHT_PHASE,
                'Enum',
                this.takeoffAndInitialClimbPhase.getValue(),
                () => console.log(`[CIDS/FPM${this.directorId} Initial flight phase: ${this.takeoffAndInitialClimbPhase.getValue()}`),
                true,
            );
            if (Cids.DEBUG) {
                SimVar.SetSimVarValue(`L:A32NX_CIDS_DEBUG_DIR_${this.directorId}_FLIGHT_PHASE`, 'Enum', this.takeoffAndInitialClimbPhase.getValue());
            }
            break;
        case 6:
            this.director.output(
                Cids.SimVar.FLIGHT_PHASE,
                'Enum',
                this.cruisePhase.getValue(),
                () => console.log(`[CIDS/FPM${this.directorId} Initial flight phase: ${this.cruisePhase.getValue()}`),
                true,
            );
            if (Cids.DEBUG) {
                SimVar.SetSimVarValue(`L:A32NX_CIDS_DEBUG_DIR_${this.directorId}_FLIGHT_PHASE`, 'Enum', this.cruisePhase.getValue());
            }
            break;
        case 7:
            this.director.output(
                Cids.SimVar.FLIGHT_PHASE,
                'Enum',
                this.todPhase.getValue(),
                () => console.log(`[CIDS/FPM${this.directorId} Initial flight phase: ${this.todPhase.getValue()}`),
                true,
            );
            if (Cids.DEBUG) {
                SimVar.SetSimVarValue(`L:A32NX_CIDS_DEBUG_DIR_${this.directorId}_FLIGHT_PHASE`, 'Enum', this.todPhase.getValue());
            }
            break;
        case 8:
            this.director.output(
                Cids.SimVar.FLIGHT_PHASE,
                'Enum',
                this.finalApprAndLandingPhase.getValue(),
                () => console.log(`[CIDS/FPM${this.directorId} Initial flight phase: ${this.finalApprAndLandingPhase.getValue()}`),
                true,
            );
            if (Cids.DEBUG) {
                SimVar.SetSimVarValue(`L:A32NX_CIDS_DEBUG_DIR_${this.directorId}_FLIGHT_PHASE`, 'Enum', this.finalApprAndLandingPhase.getValue());
            }
            break;
        default:
            console.error(`[CIDS/FPM${this.directorId} Found unknown value '${startState}' for A32NX_START_STATE.`);
            break;
        }
    }
}
