function toggleMenu(){
  document.getElementById('drawer').classList.toggle('open');
  document.querySelectorAll('.menubtn').forEach(function(b){b.classList.toggle('active');});
}
function closeMenu(){
  document.getElementById('drawer').classList.remove('open');
  document.querySelectorAll('.menubtn').forEach(function(b){b.classList.remove('active');});
}
