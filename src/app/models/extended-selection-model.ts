import { SelectionModel } from '@angular/cdk/collections';

export class ExtendedSelectionModel<T> extends SelectionModel<T> {
    public allSelected = false;
}
