import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../log-in/services/auth.service';
import { Router } from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { VentasService } from '../ventas.service';
import { Operacion } from './clases/Operacion';

import { MatSort } from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
// import { SortEvent } from 'primeng/api';
import { MatTableDataSource } from '@angular/material/table';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import Swal from "sweetalert2";

@Component({
  selector: 'app-admin-ventas',
  templateUrl: './admin-ventas.component.html',
  styleUrls: ['./admin-ventas.component.scss'],
  animations: [
    trigger('detailExpand',
    [
        state('collapsed, void', style({ height: '0px'})),
        state('expanded', style({ height: '*' })),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AdminVentasComponent implements OnInit {

  key = "";
  state = "";


  ventas:Operacion[] = [];
  filter = "";
  estadosOperacion = ["PAYMENT_PENDING", "PAYMENT_DONE", "SENT", "RECEIVED", "CANCELLED"];

  updateStateVenta: Operacion;

  columnsToDisplay = ['nroOperacion', 'cliente.nombre', 'direccion.calle', 'fechaOperacion', 'fechaEnvio', 'fechaEntrega', 'estado', 'total', 'tools'];
  data = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor( private router:Router,
               private authService: AuthService,
               private ventasServices:  VentasService,
               private modalService: NgbModal ) { }

  ngOnInit(): void {
    
    this.obtenerVentas();
    this.updateStateVenta = new Operacion();
    
  }


  obtenerVentas(){
    this.ventasServices.getVentas().subscribe((resp:any) => {
      this.ventas = resp;
      this.data.data = this.ventas
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;

      console.log(this.ventas);
    })
  };

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.data.filter = filterValue.trim().toLowerCase();
  };

  reset(){
    this.key = "";
    this.state = "";
    this.filter = "";
    this.data.filter = "";
  };

  prueba(){
    
    if (this.updateStateVenta.estado === "PAYMENT_DONE") {
      return "Enviado"
    }else if(this.updateStateVenta.estado === "SENT") {
       return "Recibido"
    }
    
  };

  openLg(content, venta: Operacion) {
    this.updateStateVenta = venta;
    console.log(this.updateStateVenta);
    
    this.modalService.open(content, { centered: true });
  }

  updateVentaSent(){

    let siguienteEstado: string;

    if (this.updateStateVenta.estado === "PAYMENT_DONE") {
      siguienteEstado = "Enviado";
    }else if(this.updateStateVenta.estado === "SENT"){
      siguienteEstado = "Recibido";
    }
    console.log(siguienteEstado);
    

    Swal.fire({
      title: `Está por actualizar el estado de la venta a ${siguienteEstado}`,
      text: "¿Está seguro que desea hacerlo?",
      icon: 'warning',
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1f4e84',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {

        this.ventasServices.updateVentaSent(this.updateStateVenta.nroOperacion).subscribe((resp:any) => {
          console.log(resp);
        })

        Swal.fire(
          '¡Listo!',
          'El estado ha sido actualizado con éxito.',
          'success'
        )
        this.obtenerVentas();
        this.modalService.dismissAll();
        
      }
    })



    
  }

  

}
