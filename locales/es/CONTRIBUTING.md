# Contribuyendo a Zentara Code

En primer lugar, ¡gracias por considerar contribuir a Zentara Code! Son personas como tú las que hacen que el código abierto sea una comunidad tan grandiosa.

## ¿A dónde voy desde aquí?

Si has notado un error o tienes una solicitud de función, ¡[crea una](https://github.com/your-username/zentara-code/issues/new/choose)! (Reemplaza `your-username/zentara-code` con la ruta real de tu repositorio de GitHub). Generalmente es mejor que obtengas la confirmación de tu error o la aprobación de tu solicitud de función de esta manera antes de comenzar a codificar.

Si tienes una pregunta general, también puedes abrir un issue.

## Bifurcar y crear una rama

Si crees que puedes solucionar esto, entonces [bifurca Zentara Code](https://github.com/your-username/zentara-code/fork) y crea una rama con un nombre descriptivo.

Un buen nombre de rama sería (donde el issue #325 es el ticket en el que estás trabajando):

```sh
git checkout -b 325-add-japanese-localization
```

## Poner en marcha la suite de pruebas

Asegúrate de poder poner en marcha la suite de pruebas. ¡Valoramos el código bien probado!
(Deberás agregar instrucciones específicas aquí sobre cómo ejecutar tus pruebas, por ejemplo, `npm test` o `python -m unittest discover`)

## Implementar tu corrección o función

¡En este punto, estás listo para hacer tus cambios! No dudes en pedir ayuda; todos somos principiantes al principio :smile_cat:

Asegúrate de:
*   Seguir el estilo de codificación del proyecto.
*   Ejecutar linters y formateadores (por ejemplo, Prettier, ESLint). (Agrega comandos específicos si están disponibles)
*   Agregar pruebas para tus cambios.

## Hacer una solicitud de extracción

En este punto, debes volver a tu rama maestra y asegurarte de que esté actualizada con la rama maestra de Zentara Code:

```sh
git remote add upstream git@github.com:your-username/zentara-code.git
git checkout master
git pull upstream master
```

Luego, actualiza tu rama de características desde tu copia local de master, ¡y súbela!

```sh
git checkout 325-add-japanese-localization
git rebase master
git push --force-with-lease origin 325-add-japanese-localization
```

Finalmente, ve a GitHub y [haz una solicitud de extracción](https://github.com/your-username/zentara-code/compare) :D

### Plantilla de solicitud de extracción

Cuando abras una solicitud de extracción, utiliza la siguiente plantilla:

```markdown
### Problema(s) vinculado(s)

* Cierra # (número de problema)

### Descripción

(Proporciona una breve descripción de los cambios en esta PR.)

### Lista de verificación

- [ ] He leído el documento [CONTRIBUTING.md](CONTRIBUTING.md).
- [ ] He añadido pruebas para cubrir mis cambios.
- [ ] Todas las pruebas nuevas y existentes pasaron.
- [ ] He actualizado la documentación en consecuencia.
- [ ] He rebasado mi rama sobre el último commit de `master`.
- [ ] Mi código sigue el estilo de codificación del proyecto.
- [ ] He ejecutado linters y he solucionado todos los problemas.
```

## Código de Conducta

Este proyecto y todos los que participan en él se rigen por el [Código de Conducta de Zentara Code](CODE_OF_CONDUCT.md). Al participar, se espera que respetes este código. Por favor, informa de comportamientos inaceptables a [INSERTAR MÉTODO DE CONTACTO EN CODE_OF_CONDUCT.MD].

## Licencias

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la Licencia Apache 2.0, tal como se encuentra en el archivo [LICENSE](LICENSE).
