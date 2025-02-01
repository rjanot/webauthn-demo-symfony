<?php

namespace App\Controller;

use App\Repository\WebauthnCredentialRepository;
use App\Repository\WebauthnUserEntityRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ProfileController extends AbstractController
{
    #[Route('/profile', name: 'app_profile')]
    public function index(WebauthnCredentialRepository $webauthnCredentialRepository, WebauthnUserEntityRepository $webauthnUserEntityRepository): Response
    {
        $webauthnCredentials = $webauthnCredentialRepository->findAllForUserEntity(
            $webauthnUserEntityRepository->findOneByUsername($this->getUser()->getUserIdentifier())
        );

        return $this->render('profile/index.html.twig', [
            'webauthnCredentials' => $webauthnCredentials,
        ]);
    }
}
