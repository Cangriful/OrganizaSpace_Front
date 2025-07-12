import { Component } from '@angular/core';
import { Espacios } from '../../../models/espacios';
import { EspaciosService } from '../../services/espacios-service';
/*Este componente es para ver los espacios de casa*/
@Component({
  selector: 'app-espacios-casa-component',
  standalone: false,
  templateUrl: './espacios-casa-component.html',
  styleUrl: './espacios-casa-component.css'
})
export class EspaciosCasaComponent {
  /*array de espacios*/
 espacios: Espacios[] = [];

  constructor(private espaciosService: EspaciosService) {}

  ngOnInit(): void {
    this.espaciosService.obtenerEspacios().subscribe(data => this.espacios = data);
  }
}

/*casa*/
