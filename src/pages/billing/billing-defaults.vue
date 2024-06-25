<template>
  <VCol cols="12" md="12" lg="12">
    <VCard class="text-center">
      <v-divider></v-divider>
      <v-progress-circular v-if="IsLoadingBillingPage" :size="50" color="primary" indeterminate></v-progress-circular>
      <div v-else class="px-4 py-4" style="min-height: 400px">
        <v-data-table id="providerTable" class="elevation-1 px-4" :headers="headers" :items="connectionData"
          style="min-height: 450px; font-size: 10pt" :sort-by="[{ key: 'calories', order: 'asc' }]">
          <template v-slot:top>
            <VRow class="align-center">
              <VCol cols="12" md="4" sm="6">
                <v-autocomplete v-model="providerModel" label="Master Providers" :items="getProviders"></v-autocomplete>
              </VCol>
              <VCol cols="12" md="4" sm="6">
                <v-text-field label="Year" v-model="yearModel"></v-text-field>
              </VCol>
              <VCol cols="12" md="4" sm="6">
                <v-autocomplete v-model="monthModel" label="Month" :items="[
                  'All',
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ]"></v-autocomplete>
              </VCol>
              <VCol cols="12" md="4" sm="6">
                <v-autocomplete v-model="statusModel" label="Status" :items="getStatus"></v-autocomplete>
              </VCol>
              <VCol cols="12" md="4" sm="6">
                <v-autocomplete v-model="paidModel" label="Paid Type"
                  :items="['All', 'Prepaid [0]', 'Postpaid [1]']"></v-autocomplete>
              </VCol>

              <VCol cols="12" md="4" sm="12" class="text-right">
                <v-btn @click="search" color="info" dark class="btn border" size="small" prepend-icon="tabler-search">
                  Search
                </v-btn>
                <v-btn color="secondary" dark class="btn border ml-4" size="small" prepend-icon="tabler-refresh"
                  @click="Reset">
                  Reset
                </v-btn>
              </VCol>
            </VRow>
          </template>
          <template v-slot:item="{ item, index }">
            <tr class="text-left" @click="openUpdateBillModal(item)">
              <td>{{ item.ID_PROFORMA }}</td>
              <td>{{ item.ID_FACTURA }}</td>
              <td>{{ item.masterName }}</td>
              <td>{{ item.ANYO_FACTURACION }}</td>
              <td>{{ item.month }}</td>
              <td>{{ item.statusName }}</td>
              <td>{{ item.RAZON_SOCIAL }}</td>
              <td>{{ item.PAIS }}</td>
              <td>{{ item.NombreCliente }}</td>
              <td>{{ item.SUBTOTAL }} €</td>
              <td>{{ item.IVA }}</td>
              <td>{{ item.TOTAL }} €</td>
              <td>{{ item.FECHA }}</td>
              <td>{{ item.MAILBILL }}</td>
              <td>{{ item.COMENTARIOS }}</td>
              <td>{{ item.TIPO_COBRO * 1 == 1 ? "Prepaid" : "Postpaid" }}</td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </VCard>
    <VDialog v-model="dialog" :width="$vuetify.display.smAndDown ? 'auto' : 1200">
      <VCard class="pa-1">
        <VCardItem class="text-center">
          <VCardTitle class="text-h5 mb-3">
            Bill
            <span class="font-italic">{{ NUMERO_FACTURA }}</span>
          </VCardTitle>
        </VCardItem>
        <v-divider></v-divider>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <span>BILLING</span>
            </VCol>
          </VRow>
          <VCard class="text-center my-4">
            <VForm class="mt-6" @submit.prevent="onFormSubmitUpdateConnection">
              <VRow>
                <VCol cols="8" offset="2">
                  <VRow>
                    <VCol cols="12" md="12" class="d-flex align-center gap-2">
                      <VTextarea v-model="billItem.INFO_PROVEEDOR" rows="2" label="Provider" class="font-xs"
                        auto-grow />
                      <v-btn icon @click="console.log('provider')">
                        <v-icon>mdi-reload</v-icon>
                      </v-btn>
                    </VCol>
                    <VCol cols="12" md="12" class="d-flex align-center gap-2">
                      <VTextarea v-model="billItem.INFO_CLIENTE" rows="2" label="Customer" class="font-xs" auto-grow />
                      <v-btn icon @click="console.log('provider')">
                        <v-icon>mdi-reload</v-icon>
                      </v-btn>
                    </VCol>
                    <VCol cols="12" md="12">
                      <VTextarea v-model="billItem.BANCO_PROVEEDOR" rows="2" label="Bank data" class="font-small"
                        auto-grow />
                    </VCol>
                    <VCol cols="12" md="12">
                      <VTextField label="Subtotal" v-model="billItem.SUBTOTAL" />
                    </VCol>
                    <VCol cols="12" md="12">
                      <VTextField label="TAX(%)" v-model="billItem.IVA" />
                    </VCol>
                    <VCol cols="12" md="12">
                      <VTextField label="Total" v-model="billItem.TOTAL" />
                    </VCol>
                    <VCol cols="12" md="12">
                      <VTextField label="Date" v-model="billItem.FECHA" />
                    </VCol>
                    <VCol cols="12" md="12">
                      <VSelect label="Status" :items="getStatus" v-model="billItem.statusName" />
                    </VCol>
                    <VCol cols="12" md="12">
                      <VTextField label="Commentation" v-model="billItem.COMENTARIOS" />
                    </VCol>
                    <VCol cols="12" md="12">
                      <VTextField label="Last Change" v-model="billItem.LASTCHANGE" />
                    </VCol>
                  </VRow>
                </VCol>
              </VRow>
              <VRow class="mb-2">
                <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
                  <VBtn type="submit"> Update </VBtn>
                  <VBtn color="secondary" variant="tonal" @click="onFormReset">Cancel</VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCard>
          <VRow>
            <VCol cols="12">
              <span> CONCEPT</span>
            </VCol>
          </VRow>
          <VCard class="my-4">
            <v-divider></v-divider>
            <v-data-table-virtual class="elevation-1 px-4" :headers="billConceptHeader" :items="billConceptData"
              height="240" :sort-by="[{ key: 'calories', order: 'asc' }]">
              <template v-slot:item="{ item, index }">
                <tr class="text-left" @click="openConceptDialog(item)">
                  <td>{{ item.ID_CONCEPTO }}</td>
                  <td>{{ item.CONCEPTO }}</td>
                  <td>{{ item.DESCRIPCION }}</td>
                  <td>{{ item.CANTIDAD }}</td>
                  <td>{{ item.PRECIO }}</td>
                  <td>{{ item.MONEDA }}</td>
                  <td>{{ item.SUBTOTAL }}</td>
                </tr>
              </template>
            </v-data-table-virtual>
          </VCard>
          <VRow>
            <VCol cols="12">
              <span> ENTRIES</span>
            </VCol>
          </VRow>
          <VCard class="my-4">
            <v-divider></v-divider>
            <v-data-table-virtual class="elevation-1 px-4" :headers="billDetailHeader" :items="billDetailData"
              height="240" :sort-by="[{ key: 'calories', order: 'asc' }]">
              <template v-slot:item="{ item, index }">
                <tr class="text-left" @click="openEntriedDialog(item)">
                  <td>{{ item.ID_APUNTE }}</td>
                  <td class="flag_country">
                    <VImg v-if="!item.PAIS_DESTINO || item.PAIS_DESTINO == '*'" :min-width="32" :src="`${serverUrl}/flags/0.png`"/>
                    <VImg v-else :min-width="32" :src="`${serverUrl}/flags/${item.PAIS_DESTINO}.png`"/>
                    {{ item.state }}
                  </td>
                  <td>{{ item.SERVICIO }}</td>
                  <td>{{ item.ID_MASTERBULK }}</td>
                  <td>{{ item.CANTIDAD }}</td>
                  <td>{{ item.CANTIDAD2 }}</td>
                  <td>{{ item.CONVERSION }}</td>
                  <td>{{ item.DETALLES }}</td>
                  <td>{{ item.COSTE }}</td>
                  <td>{{ item.MONEDA }}</td>
                  <td>{{ item.TOTAL }}</td>
                </tr>
              </template>
            </v-data-table-virtual>
          </VCard>
          <VRow>
            <VCol cols="12">
              <span> DOWNLOAD</span>
            </VCol>
          </VRow>
          <VCol cols="12" sm="12" class="text-right d-flex flex-wrap justify-center gap-4 mt-4 pt-4">
            <v-btn color="primary" dark class="btn border mr-4">
              Proforma
            </v-btn>
            <v-btn color="primary" dark class="btn border mr-4">
              Proforma+
            </v-btn>
            <v-btn color="primary" dark class="btn border mr-4"> Bill </v-btn>
          </VCol>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog v-model="conceptDialog" :width="$vuetify.display.smAndDown ? 'auto' : 800">
      <VCard class="pa-1">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <span>Edition</span>
            </VCol>
          </VRow>
          <VCard class="my-4">
            <VForm class="mt-6" @submit.prevent="onFormSubmitUpdateConnection">
              <VRow>
                <VCol cols="10" offset="1" class="text-right">
                  <VRow>
                    <VCol cols="3">Data</VCol>
                    <VCol class="text-center" cols="9">Value</VCol>
                    <v-divider class="mb-4"></v-divider>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Master</VCol>
                    <VCol cols="9">
                      <VTextField v-model="billItem.IVA" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Bill</VCol>
                    <VCol cols="9">
                      <VTextField v-model="billItem.IVA" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Customer</VCol>
                    <VCol cols="9">
                      <VTextField v-model="billItem.IVA" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Year</VCol>
                    <VCol cols="9">
                      <VTextField v-model="billItem.IVA" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">ID Concept</VCol>
                    <VCol cols="9">
                      <VTextField v-model="billItem.IVA" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Concept</VCol>
                    <VCol cols="9">
                      <VSelect :items="getStatus" v-model="billItem.status" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Description</VCol>
                    <VCol cols="9">
                      <VTextField v-model="billItem.TOTAL" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Quantity</VCol>
                    <VCol cols="9">
                      <VTextField type="number" v-model="billItem.TOTAL" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Price</VCol>
                    <VCol cols="9">
                      <VTextField type="number" v-model="billItem.TOTAL" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Currency</VCol>
                    <VCol cols="9">
                      <VSelect :items="getStatus" v-model="billItem.status" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Subtotal </VCol>
                    <VCol cols="9">
                      <VTextField type="number" v-model="billItem.TOTAL" />
                    </VCol>
                  </VRow>
                </VCol>
              </VRow>
              <VRow class="mb-2">
                <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
                  <v-progress-circular v-if="IsLoading" :size="45" color="primary" indeterminate></v-progress-circular>
                  <VBtn type="submit">Update</VBtn>
                  <VBtn color="secondary" variant="tonal" @click="onFormReset">Cancel</VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCard>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog v-model="entriesDialog" :width="$vuetify.display.smAndDown ? 'auto' : 800">
      <VCard class="pa-1">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <span>Edition</span>
            </VCol>
          </VRow>
          <VCard class="my-4">
            <VForm class="mt-6" @submit.prevent="onFormSubmitUpdateConnection">
              <VRow>
                <VCol cols="10" offset="1" class="text-right">
                  <VRow>
                    <VCol cols="3">Data</VCol>
                    <VCol cols="9" class="text-center">Value</VCol>
                    <v-divider class="mb-4"></v-divider>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Master</VCol>
                    <VCol cols="9">
                      <VSelect :items="getStatus" v-model="billItem.status" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Bill</VCol>
                    <VCol cols="9">
                      <VTextField v-model="billItem.IVA" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Customer</VCol>
                    <VCol cols="9">
                      <VSelect :items="getStatus" v-model="billItem.status" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Entries</VCol>
                    <VCol cols="9">
                      <VTextField v-model="newConnectionItem.IVA" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Year</VCol>
                    <VCol cols="9">
                      <VTextField v-model="newConnectionItem.IVA" outlined disabled />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Service</VCol>
                    <VCol cols="9">
                      <VTextField v-model="newConnectionItem.TOTAL" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Type of charge</VCol>
                    <VCol cols="9">
                      <VSelect :items="getStatus" v-model="newConnectionItem.status" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Submited</VCol>
                    <VCol cols="9">
                      <VTextField type="number" v-model="newConnectionItem.TOTAL" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Delivered</VCol>
                    <VCol cols="9">
                      <VTextField type="number" v-model="newConnectionItem.TOTAL" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Ratio</VCol>
                    <VCol cols="9">
                      <VTextField type="number" v-model="newConnectionItem.TOTAL" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Cost</VCol>
                    <VCol cols="9">
                      <VTextField type="number" v-model="newConnectionItem.TOTAL" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Currency</VCol>
                    <VCol cols="9">
                      <VSelect :items="getStatus" v-model="newConnectionItem.status" />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="3" class="mt-1">Total</VCol>
                    <VCol cols="9">
                      <VTextField type="number" v-model="newConnectionItem.TOTAL" />
                    </VCol>
                  </VRow>
                </VCol>
              </VRow>
              <VRow class="mb-2">
                <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
                  <v-progress-circular v-if="IsLoading" :size="45" color="primary" indeterminate></v-progress-circular>
                  <VBtn type="submit">Update</VBtn>
                  <VBtn color="secondary" variant="tonal" @click="onFormReset">Cancel</VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCard>
        </VCardText>
      </VCard>
    </VDialog>
  </VCol>
</template>
<script>
import { createNamespacedHelpers } from "vuex";
import { notify } from "@/utils";
const { mapGetters, mapActions, mapState } = createNamespacedHelpers("billing");

export default {
  data() {
    return {
      isBox: false,
      serverUrl: window.configData.APP_BASE_URL,
      headers: [
        { title: "Proforma", align: "start", key: "ID_PROFORMA" },
        { title: "Bill ID", align: "start", key: "ID_FACTURA" },
        { title: "Master", align: "start", key: "masterName" },
        { title: "Year", align: "start", key: "ANYO_FACTURACION" },
        { title: "Month", align: "start", key: "month" },
        { title: "Status", align: "start", key: "statusName" },
        { title: "Business name", align: "start", key: "RAZON_SOCIAL" },
        { title: "Destination Country", align: "start", key: "PAIS" },
        { title: "Customer", align: "start", key: "ID_Cliente" },
        { title: "Subtotal", align: "start", key: "SUBTOTAL" },
        { title: "Tax(%)", align: "start", key: "IVA" },
        { title: "Total", align: "start", key: "TOTAL" },
        { title: "Date", align: "start", key: "FECHA" },
        { title: "Email", align: "start", key: "MAILBILL" },
        { title: "Comments", align: "start", key: "COMENTARIOS" },
        { title: "Type of charge", align: "start", key: "TIPO_COBRO" },
      ],
      billConceptHeader: [
        { title: "#", align: "start", key: "ID_CONCEPTO" },
        { title: "Concept", align: "start", key: "CONCEPTO" },
        { title: "Description", align: "start", key: "DESCRIPCION" },
        { title: "Quality", align: "start", key: "CANTIDAD" },
        { title: "Price", align: "start", key: "PRECIO" },
        { title: "Currency", align: "start", key: "MONEDA" },
        { title: "Subtotal", align: "start", key: "SUBTOTAL" },
      ],
      billDetailHeader: [
        { title: "Entries", align: "start", key: "ID_APUNTE" },
        { title: "Country", align: "start", key: "PAIS_DESTINO" },
        { title: "Operator", align: "start", key: "SERVICIO" },
        { title: "Master", align: "start", key: "ID_MASTERBULK" },
        { title: "Submited", align: "start", key: "CANTIDAD" },
        { title: "Delivered", align: "start", key: "CANTIDAD2" },
        { title: "Conversion", align: "start", key: "CONVERSION" },
        { title: "Type", align: "start", key: "DETALLES" },
        { title: "Conversion", align: "start", key: "CONVERSION" },
        { title: "Cost", align: "start", key: "COSTE" },
        { title: "Currency", align: "start", key: "MONEDA" },
        { title: "Total", align: "start", key: "TOTAL" },
      ],
      providerModel: null,
      statusModel: null,
      yearModel: null,
      monthModel: null,
      paidModel: null,
      connectionData: [],
      billConceptData: [],
      billDetailData: [],
      dialog: false,
      conceptDialog: false,
      entriesDialog: false,
      billItem: {
        INFO_PROVEEDOR: null,
        INFO_CLIENTE: null,
        BANCO_PROVEEDOR: null,
        SUBTOTAL: null,
        IVA: null,
        TOTAL: null,
        FECHA: null,
        IIDEstado: null,
        COMENTARIOS: null,
        ID_MASTERBULK: null,
        ID_CLIENTE: null,
        ID_Factura: null,
        ID_Proforma: null,
        NUMERO_FACTURA: null,
        ID_HISTORICO: null,
        IAnyoFacturacion: null,
        LASTCHANGE: null,
        statusName: null,
      },
      billConceptItem: {
        ID_CONCEPTO: null,
        CONCEPTO: null,
        DESCRIPCION: null,
        CANTIDAD: null,
        PRECIO: null,
        MONEDA: null,
        SUBTOTAL: null,
        ID_MASTERBULK: null,
        ID_CLIENTE: null,
        ID_Factura: null,
        ID_HISTORICO: null,
        ANYO_FACTURACION: null,
      },
      billDetailItem: {
        ID_APUNTE: null,
        PAIS_DESTINO: null,
        SERVICIO: null,
        ID_MASTERBULK: null,
        CANTIDAD: null,
        CANTIDAD2: null,
        CONVERSION: null,
        DETALLES: null,
        COSTE: null,
        MONEDA: null,
        TOTAL: null,
        state: null,
        ID_CLIENTE: null,
        ID_Factura: null,
        ID_HISTORICO: null,
        ANYO_FACTURACION: null,
        iIDFactura: null,
      },
      IsLoadingBillingPage: true,
    };
  },
  computed: {
    ...mapGetters([
      "GetBillingDefaultData",
      "GetBillingDefaultsItemData",
      "IsLoading",
      "GetError",
    ]),
    getStatus: function () {
      const statusList = this.GetBillingDefaultData?.statusList;
      if (!statusList) return [];
      return Object.keys(statusList)?.map(
        (name) => `${statusList[name]} [${name.replace("s", "")}]`
      );
    },
    getProviders: function () {
      const masterProviderList = this.GetBillingDefaultData?.masterProviderList;
      if (!masterProviderList) return [];
      return Object.keys(masterProviderList)?.map(
        (name) =>
          `${masterProviderList[name].NOMBRE} [${masterProviderList[name].ID_MASTER}]`
      );
    },
  },
  mounted() {
    this.yearModel = 2024;
    this.fetchBillingDefaultsData({}).then(() => {
      this.connectionData = this.GetBillingDefaultData?.data;
      this.IsLoadingBillingPage = false;
    });
  },
  methods: {
    ...mapActions(["fetchBillingDefaultsData", "fetchBillingDefaultsItemData"]),
    search() {
      this.IsLoadingBillingPage = true;
      this.fetchBillingDefaultsData({
        iIDMasterBulk: parseInt(this.providerModel?.match(/\[(\d+)\]/)[1]),
        iMes: this.getMonthIndex(this.monthModel),
        iAnyo: this.yearModel,
        iIDEstado: parseInt(this.statusModel?.match(/\[(\d+)\]/)[1]),
        iTipoCobro:
          this.paidModel == "All"
            ? -1
            : parseInt(this.paidModel?.match(/\[(\d+)\]/)[1]),
      }).then(() => {
        this.connectionData = this.GetBillingDefaultData?.data;
        this.IsLoadingBillingPage = false;
      });
    },
    Reset() {
      (this.statusModel = null), (this.providerModel = null);

      this.search();
    },
    getMonthIndex(moName) {
      const monthes = {
        All: 0,
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };

      return monthes[moName];
    },
    onFormSubmitUpdateConnection() {
      console.log("new connectionData", billItem);
    },
    onFormReset() {
      this.dialog = false;
      this.conceptDialog = false;
      this.entriesDialog = false;
    },
    openUpdateBillModal(item) {
      this.fetchBillingDefaultsItemData({
        iIDMasterBulk: item.ID_MasterBulk,
        iIDCliente: item.ID_Cliente,
        iAnyoFacturacion: item.ANYO_FACTURACION,
        iIDFactura: item.ID_FACTURA,
      }).then(() => {
        this.billItem = {
          ...this.GetBillingDefaultsItemData?.bill,
          IAnyoFacturacion: item.ANYO_FACTURACION,
          statusName: item.statusName,
        };
        this.billConceptData = this.GetBillingDefaultsItemData?.billConcept;
        this.billDetailData = this.GetBillingDefaultsItemData?.billDetail;
        this.dialog = true;
      });
    },
    openConceptDialog(item) {
      this.conceptDialog = true;
    },
    openEntriedDialog(item) {
      this.entriesDialog = true;
    },
  },
  watch: {
    GetError(value) {
      if (value != null) {
        notify(value, "error");
      }
    },
  },
};
</script>
