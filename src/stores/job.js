import { defineStore } from "pinia";
import api from "@/api";

export const useJobStore = defineStore({
  id: "job",
  state: () => ({
    data: { cod_municipio: null },
    cod_municipio: null,
    cod_division: "",
    estado: "",
    propietario: null,
    mensaje: "",
    linea: 0,
    log: [],
    informe: [],
    report: {},
    revisar: [],
    callejero: [],
  }),

  getters: {},

  actions: {
    async getJob(cod_municipio, cod_division) {
      const linea = this.estado == "RUNNING" ? this.linea : 0;
      const log = this.linea == 0 ? [] : this.log;
      const provincia = cod_municipio.substring(0, 2);
      const response = await api.getJob(cod_municipio, cod_division, linea);
      this.$state = response.data;
      this.log = log.concat(this.log);
      if (this.informe.length == 0) {
        this.edificios = true;
        this.direcciones = true;
        this.idioma = "es_ES";
        if (
          ["03", "07", "08", "12", "17", "25", "43", "46"].includes(provincia)
        ) {
          this.idioma = "ca_ES";
        } else if (["15", "27", "32", "36"].includes(provincia)) {
          this.idioma = "gl_ES";
        }
      } else {
        this.edificios = "building_date" in this.report;
        this.direcciones = "address_date" in this.report;
        this.idioma = this.report.language;
      }
    },
    async createJob() {
      const options = {
        building: this.edificios,
        address: this.direcciones,
        idioma: this.idioma,
      };
      const mun = this.cod_municipio;
      const div = this.cod_division;
      const response = await api.postJob(mun, div, options);
      this.estado = response.data.estado;
      this.mensaje = response.data.mensaje;
      return response;
    },
    async updateHighway(cat, conv) {
      let formData = new FormData();
      formData.append("cat", cat);
      formData.append("conv", conv);
      const response = await api.putHgw(this.cod_municipio, formData);
      if (response.data.length > 0) {
        this.callejero = response.data;
      }
    },
  },
});
