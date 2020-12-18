
<script>
import { Bar, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;

export default {
  extends: Bar,
  mixins: [
    reactiveProp,
  ],
  mounted() {
    this.renderChart(this.chartData, {
      legend: {
        display: false,
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    });
  },
};
</script>
